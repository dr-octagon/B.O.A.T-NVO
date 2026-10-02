const http = require('node:http');
const { randomUUID } = require('node:crypto');
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
    const sessions = new Map();
    const server = http.createServer(async (req, res) => {
        const send = (status, data) => {
            res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
            res.end(JSON.stringify(data));
        };
        // Native plugin requests have no Origin. Browsers must not register playlists.
        const route = (req.url || '').split('?')[0];
        if (req.headers.origin && route === '/playlists') return send(403, { error: 'Native requests only' });
        for (const [key, session] of sessions) if (Date.now() - session.created > TTL) sessions.delete(key);
        if (req.method === 'GET' && route === '/health') return send(200, { service: 'nuvio-hls', version: 1 });
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
