const http = require('node:http');
const { randomUUID, createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { gunzipSync } = require('node:zlib');
const { cinejoyBinary, tmdbJson } = require('./desktop_provider_transport');
const { createLiveTransport } = require('./desktop_live_transport');
const REVISION = createHash('sha256').update(readFileSync(__filename)).digest('hex');
const TRANSPORT_REVISION = createHash('sha256').update(readFileSync(require.resolve('./desktop_provider_transport'))).digest('hex');
const LIVE_REVISION = createHash('sha256').update(readFileSync(require.resolve('./desktop_live_transport'))).digest('hex');
const isHls = text => typeof text === 'string' && /^\s*#EXTM3U\b/.test(text);

const PORT = 18765;
const MAX_BODY = 4 * 1024 * 1024;
const TTL = 12 * 60 * 60 * 1000;

function rewritePlaylist(text, base, urls) {
    const resolve = value => {
        const absolute = new URL(value, base).href;
        return urls.get(absolute) || absolute;
    };
    return text.split(/\r?\n/).map(line => {
        if (!line.trim()) return line;
        if (!line.startsWith('#')) return resolve(line.trim());
        return line.replace(/URI="([^"]+)"/g, (_, uri) => `URI="${resolve(uri)}"`);
    }).join('\n');
}

function createBridge() {
    let server;
    const live = createLiveTransport(() => server.address().port);
    const sessions = new Map();
    const catalogs = new Map();
    const foldCatalogTitle = value => String(value || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, ' ').trim();
    const catalogBase = 'https://raw.githubusercontent.com/dr-octagon/Cloudstream-BronzeCloud/builds';
    async function dominoCatalog(name) {
        if (!['home_bundle', 'search', 'series_extra'].includes(name)) throw new Error('Unknown catalog');
        if (!catalogs.has(name) || catalogs.get(name).expires < Date.now()) {
            const promise = (async () => {
                const response = await fetch(`${catalogBase}/dominotv_${name}.json.gz`, { signal: AbortSignal.timeout(15000) });
                if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
                const bytes = Buffer.from(await response.arrayBuffer());
                if (bytes.length > 16 * 1024 * 1024) throw new Error('Catalog size limit');
                return JSON.parse((bytes[0] === 31 && bytes[1] === 139 ? gunzipSync(bytes, { maxOutputLength: 64 * 1024 * 1024 }) : bytes).toString('utf8'));
            })();
            catalogs.set(name, { promise, expires: Date.now() + 60 * 60 * 1000 });
            promise.catch(() => catalogs.delete(name));
        }
        return catalogs.get(name).promise;
    }
    server = http.createServer(async (req, res) => {
        const send = (status, data) => {
            res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
            res.end(JSON.stringify(data));
        };
        // Native plugin requests have no Origin. Browsers must not register playlists.
        const route = (req.url || '').split('?')[0];
        if (req.headers.origin && (route === '/playlists' || route.startsWith('/catalog/') || route.startsWith('/transport/'))) return send(403, { error: 'Native requests only' });
        for (const [key, session] of sessions) if (Date.now() - session.created > TTL) sessions.delete(key);
        if (req.method === 'GET' && route === '/health') return send(200, { service: 'nuvio-hls', version: 4, revision: REVISION, transportRevision: TRANSPORT_REVISION, liveRevision: LIVE_REVISION, transports: ['tmdb-json', 'cinejoy-binary', 'bcsports-live'] });
        if (await live(req, res, send)) return;
        if (req.method === 'GET' && route === '/transport/tmdb') {
            try { return send(200, await tmdbJson(new URL(req.url, 'http://127.0.0.1').searchParams.get('path'))); }
            catch (error) { return send(502, { error: error.message }); }
        }
        if (req.method === 'POST' && route === '/transport/cinejoy') {
            try {
                const chunks = []; let size = 0;
                for await (const chunk of req) { size += chunk.length; if (size > 70000) { send(413, { error: 'Binary body size limit' }); req.destroy(); return; } chunks.push(chunk); }
                return send(200, await cinejoyBinary(JSON.parse(Buffer.concat(chunks).toString('utf8'))));
            } catch (error) { return send(502, { error: error.message }); }
        }
        if (req.method === 'GET' && route.startsWith('/catalog/domino/')) {
            try {
                const query = new URL(req.url, 'http://127.0.0.1').searchParams;
                const kind = query.get('type') === 'series' ? 'series' : 'movie';
                if (route === '/catalog/domino/section') {
                    const data = await dominoCatalog('home_bundle'), key = query.get('section');
                    const skip = Math.max(0, Number(query.get('skip')) || 0), ids = (data.sections[key] || []).slice(skip, skip + 20);
                    const items = new Map((kind === 'movie' ? data.movies : data.series).map(item => [item.i, item]));
                    return send(200, ids.map(id => items.get(id)).filter(Boolean));
                }
                if (route === '/catalog/domino/search') {
                    const search = foldCatalogTitle(query.get('q'));
                    const data = await dominoCatalog('search');
                    return send(200, data.filter(item => foldCatalogTitle(item.t).includes(search) && item.t_type === (kind === 'series' ? 1 : 0)).slice(0, 50));
                }
                if (route === '/catalog/domino/item') {
                    const id = Number(query.get('id')), data = await dominoCatalog('home_bundle');
                    let item = (kind === 'movie' ? data.movies : data.series).find(item => item.i === id);
                    if (kind === 'movie' && !item) item = (await dominoCatalog('search')).find(item => item.i === id && item.t_type === 0);
                    if (kind === 'series' && !item?.eps?.length) item = (await dominoCatalog('series_extra')).find(item => item.i === id);
                    return send(200, item || null);
                }
                return send(404, { error: 'Unknown catalog operation' });
            } catch (error) { return send(502, { error: error.message }); }
        }
        if (req.method === 'POST' && route === '/playlists') {
            try {
                let size = 0;
                const chunks = [];
                for await (const chunk of req) {
                    size += chunk.length;
                    if (size > MAX_BODY) { send(413, { error: 'Playlist size limit' }); req.destroy(); return; }
                    chunks.push(chunk);
                }
                const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                if (!Array.isArray(data.playlists) || !data.playlists.length || data.playlists.length > 32) throw new Error('Invalid playlists');
                for (const item of data.playlists) {
                    if (!/^https?:\/\//.test(item.sourceUrl) || !isHls(item.text)) throw new Error('Invalid HLS source');
                }
                const id = randomUUID();
                const urls = new Map();
                const port = server.address().port;
                data.playlists.forEach((item, i) => {
                    const url = `http://127.0.0.1:${port}/hls/${id}/${i}.m3u8`;
                    urls.set(item.sourceUrl, url);
                    if (item.baseUrl) urls.set(item.baseUrl, url);
                });
                if (!urls.has(data.root)) throw new Error('Missing root');
                const files = data.playlists.map(item => rewritePlaylist(item.text, item.baseUrl || item.sourceUrl, urls));
                if (sessions.size >= 128) sessions.delete(sessions.keys().next().value);
                sessions.set(id, { files, created: Date.now() });
                return send(200, { url: urls.get(data.root) });
            } catch (error) { return send(400, { error: error.message }); }
        }
        const match = route.match(/^\/hls\/([a-f0-9-]+)\/(\d+)\.m3u8$/);
        const text = match && sessions.get(match[1])?.files[Number(match[2])];
        if (text && (req.method === 'GET' || req.method === 'HEAD')) {
            res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(text) });
            return res.end(req.method === 'HEAD' ? undefined : text);
        }
        send(404, { error: 'Playlist not found; reload sources' });
    });
    return server;
}

if (require.main === module) {
    const server = createBridge();
    server.listen(PORT, '127.0.0.1', () => console.log(`Nuvio Desktop HLS: http://127.0.0.1:${PORT}`));
    server.on('error', error => {
        if (error.code === 'EADDRINUSE') console.error('Port 18765 is already in use; check the existing helper.');
        else console.error(error);
        process.exitCode = 1;
    });
}
module.exports = { createBridge, rewritePlaylist };
