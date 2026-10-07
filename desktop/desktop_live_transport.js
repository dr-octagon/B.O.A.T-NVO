const { randomUUID } = require('node:crypto');
const { inflateSync } = require('node:zlib');
const { lookup } = require('node:dns').promises;
const { isIP } = require('node:net');
const CONFIG = 'https://raw.githubusercontent.com/dr-octagon/Cloudstream-BronzeCloud/builds/bcsports_config.json';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MAX_RESOURCE = 16 * 1024 * 1024;
function unmaskWebp(bytes) {
    if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') return bytes;
    if (bytes.length < 20 || bytes.readUInt32LE(4) + 8 !== bytes.length) throw new Error('Invalid live WebP size');
    for (let offset = 12; offset + 8 <= bytes.length;) {
        const length = bytes.readUInt32LE(offset + 4), start = offset + 8;
        if (start + length > bytes.length) throw new Error('Truncated live WebP chunk');
        if (bytes.toString('ascii', offset, offset + 4) === 'EXIF') {
            const ts = bytes.subarray(start, start + length);
            if (ts.length < 188 * 3 || ts.length % 188 !== 0) throw new Error('Live WebP MPEG-TS size mismatch');
            for (let i = 0; i < ts.length; i += 188) if (ts[i] !== 0x47) throw new Error('Live WebP MPEG-TS sync missing');
            return ts;
        }
        offset = start + length + (length & 1);
    }
    throw new Error('Live WebP MPEG-TS missing');
}
function unmaskPng(bytes) {
    if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return bytes;
    if (bytes.length < 33 || bytes[24] !== 8 || bytes[25] !== 2 || bytes[28] !== 0) throw new Error('Unsupported RGBTS PNG');
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), rowSize = width * 3;
    if (!width || !height || (rowSize + 1) * height > MAX_RESOURCE) throw new Error('RGBTS dimension limit');
    const chunks = [];
    for (let offset = 8; offset + 12 <= bytes.length;) {
        const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
        if (offset + 12 + length > bytes.length) throw new Error('Truncated RGBTS PNG');
        if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
        if (type === 'IEND') break;
        offset += 12 + length;
    }
    const raw = inflateSync(Buffer.concat(chunks), { maxOutputLength: MAX_RESOURCE });
    if (raw.length !== (rowSize + 1) * height) throw new Error('Invalid RGBTS scanlines');
    const rgb = Buffer.alloc(rowSize * height);
    const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
    for (let y = 0; y < height; y++) {
        const filter = raw[y * (rowSize + 1)]; if (filter > 4) throw new Error('Invalid PNG filter');
        for (let x = 0; x < rowSize; x++) {
            const at = y * rowSize + x, a = x >= 3 ? rgb[at - 3] : 0, b = y ? rgb[at - rowSize] : 0, c = y && x >= 3 ? rgb[at - rowSize - 3] : 0;
            const predictor = filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a + b) / 2) : paeth(a, b, c);
            rgb[at] = raw[y * (rowSize + 1) + 1 + x] + predictor & 255;
        }
    }
    if (rgb.length < 45 || rgb.toString('ascii', 0, 5) !== 'RGBTS') throw new Error('RGBTS payload missing');
    const length = rgb.readUInt32BE(9); if (!length || 45 + length > rgb.length) throw new Error('Invalid RGBTS payload size');
    const result = inflateSync(rgb.subarray(45, 45 + length), { maxOutputLength: MAX_RESOURCE });
    if (!result.length || result[0] !== 0x47) throw new Error('RGBTS MPEG-TS missing');
    return result;
}
const publicAddress = address => isIP(address) === 4 ? !/^(?:0|10|127|169\.254|192\.168|172\.(?:1[6-9]|2\d|3[01])|22[4-9]|2[3-5]\d)\./.test(address) : isIP(address) === 6 && !/^(?:::|fc|fd|fe80|::ffff:)/i.test(address);
const dnsCache = new Map();
async function publicUrl(value) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.port || url.username || url.password || isIP(url.hostname) || !url.hostname.includes('.')) throw new Error('Invalid live resource URL');
    let addresses = dnsCache.get(url.hostname);
    if (!addresses || addresses.expires < Date.now()) {
        const entries = await lookup(url.hostname, { all: true });
        if (!entries.length || entries.some(entry => !publicAddress(entry.address))) throw new Error('Nonpublic live destination');
        addresses = { expires: Date.now() + 60000 }; if (dnsCache.size > 256) dnsCache.clear(); dnsCache.set(url.hostname, addresses);
    }
    return url;
}
async function readResource(value, headers) {
    let url = await publicUrl(value);
    for (let redirects = 0; redirects < 4; redirects++) {
        const response = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(10000) });
        if ([301, 302, 303, 307, 308].includes(response.status)) { url = await publicUrl(new URL(response.headers.get('location'), url).href); continue; }
        if (!response.ok) throw new Error('Live upstream HTTP ' + response.status);
        const chunks = []; let size = 0;
        for await (const chunk of response.body) { size += chunk.length; if (size > MAX_RESOURCE) throw new Error('Live resource size limit'); chunks.push(chunk); }
        return { bytes: Buffer.concat(chunks), url: response.url || url.href, contentType: response.headers.get('content-type') || '' };
    }
    throw new Error('Live redirect limit');
}
let configCache, keyCache;
async function config() {
    if (!configCache || configCache.expires < Date.now()) {
        let data = {};
        try { const response = await fetch(CONFIG, { signal: AbortSignal.timeout(4000) }); if (response.ok) data = (await response.json()).sources || {}; } catch (_) {}
        // The built-in domain families remain usable when the config host is down.
        configCache = { data, expires: Date.now() + 120000 };
    }
    return configCache.data;
}
const rootHosts = {
    A: /^(?:[^.]+\.)?zirvedesin\d+\.cfd$/i,
    B: /(?:^|\.)(?:agastream\.com|[^.]+\.sbs|tiktokcdn(?:-[^.]+)?\.com)$/i,
    C: /(?:^|\.)(?:bc4\.live|bc4live\.[a-z]+|bc4live(?:cdn|iframe)\d+\.shop|betcolivecdn\d*\.[a-z]+)$/i,
    D: /(?:^|\.)(?:kakirikodes\.shop|jsthinkingtodaytoo\.(?:online|com)|autmnresemblenow\.[a-z]+)$/i,
    E: /(?:^|\.)(?:evrenesoglu\d+\.click|8602741\.xyz|streamsport365\.com|player-us\.xyz|fastly\.net|xmediaget\.[a-z]+)$/i,
    F: /(?:^|\.)(?:beyazelma\d+\.com|ijekhaje\.xyz)$/i
};
async function approve(data) {
    if (!rootHosts[data.mode]) throw new Error('Unknown BCSports source');
    const url = await publicUrl(data.url), sources = await config();
    const entry = sources['source_' + data.mode.toLowerCase()] || {};
    const configuredHosts = [entry.cdn, entry.origin, entry.player].filter(Boolean).map(value => new URL(value).hostname);
    if (!rootHosts[data.mode].test(url.hostname) && !configuredHosts.includes(url.hostname)) throw new Error('Unknown BCSports root host');
    const input = data.headers || {}, headers = { 'User-Agent': UA, Accept: '*/*' };
    for (const name of ['Referer', 'Origin']) if (input[name]) {
        const ref = new URL(input[name]);
        const known = [entry.origin, entry.referer, entry.cdn_referer, entry.player].filter(Boolean).map(value => new URL(value).origin);
        const fallback = /^(?:monotv\d+\.com|avrupabettv\d+\.com|avrupateve\d+\.com|leograndtv\d+\.com|kolaybettv\d+\.com|netsporcoamp\.xyz|8602741\.xyz|beyazelma\d+\.com|bc4live(?:iframe|cdn)\d+\.shop|(?:[^.]+\.)?bc4\.live)$/i.test(ref.hostname);
        if (ref.protocol !== 'https:' || ref.username || ref.password || ref.port || !known.includes(ref.origin) && !fallback) throw new Error('Unknown BCSports header origin');
        headers[name] = name === 'Origin' ? ref.origin : ref.origin + '/';
    }
    return { url: url.href, mode: data.mode, headers };
}
async function sourceDKey() {
    if (keyCache && keyCache.expires > Date.now()) return keyCache.bytes;
    let hex = 'f6b23eb5fb924ea136954c31c51f4980';
    try {
        const response = await fetch('https://kakirikod.b-cdn.net/player/player.js', { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(5000) });
        if (response.ok) { const js = await response.text(); const parts = ['attra', 'attrb', 'attrc', 'fragstr'].map(name => [...js.matchAll(new RegExp(name + '\\s*=\\s*["\']([a-f0-9]{8})["\']', 'gi'))].at(-1)?.[1]); if (parts.every(Boolean)) hex = parts.join(''); }
    } catch (_) {}
    keyCache = { bytes: Buffer.from(hex, 'hex'), expires: Date.now() + 300000 }; return keyCache.bytes;
}
function createLiveTransport(port) {
    const sessions = new Map();
    const capability = (session, url) => {
        let id = session.byUrl.get(url);
        if (!id) { id = randomUUID(); session.byUrl.set(url, id); session.resources.set(id, { url, seen: Date.now() }); }
        session.resources.get(id).seen = Date.now();
        return 'http://127.0.0.1:' + port() + '/live/' + session.id + '/' + id;
    };
    const rewrite = (session, text, base) => text.split(/\r?\n/).map(line => {
        const ref = value => capability(session, new URL(value, base).href);
        if (!line.trim()) return line;
        if (!line.startsWith('#')) return ref(line.trim());
        return line.replace(/URI="([^"]+)"/g, (_, value) => 'URI="' + ref(value) + '"');
    }).join('\n');
    return async function live(req, res, send) {
        const route = (req.url || '').split('?')[0];
        if (!route.startsWith('/live')) return false;
        if (req.headers.origin && route === '/live/register') { send(403, { error: 'Native requests only' }); return true; }
        for (const [id, session] of sessions) if (Date.now() - session.used > 2 * 60 * 60 * 1000) sessions.delete(id);
        if (req.method === 'POST' && route === '/live/register') {
            try {
                const chunks = []; let size = 0;
                for await (const chunk of req) { size += chunk.length; if (size > 16384) throw new Error('Live registration size limit'); chunks.push(chunk); }
                const data = await approve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
                const root = await readResource(data.url, data.headers), text = root.bytes.toString('utf8');
                if (!/^\s*#EXTM3U\b/.test(text)) throw new Error('Live root is not HLS');
                const session = { ...data, id: randomUUID(), used: Date.now(), resources: new Map(), byUrl: new Map(), cache: new Map() };
                if (sessions.size >= 64) sessions.delete(sessions.keys().next().value);
                sessions.set(session.id, session);
                const rootUrl = capability(session, data.url);
                send(200, { url: rootUrl + '/index.m3u8' });
            } catch (error) { send(502, { error: error.message }); }
            return true;
        }
        const match = route.match(/^\/live\/([a-f0-9-]+)\/([a-f0-9-]+)(?:\/index\.m3u8)?$/);
        const session = match && sessions.get(match[1]), resource = session && session.resources.get(match[2]);
        if (!resource || !['GET', 'HEAD'].includes(req.method)) { send(404, { error: 'Live source expired; reload sources' }); return true; }
        session.used = resource.seen = Date.now();
        for (const [id, item] of session.resources) if (id !== match[2] && Date.now() - item.seen > 600000) { session.resources.delete(id); session.byUrl.delete(item.url); session.cache.delete(item.url); }
        if (session.resources.size > 4096) { send(502, { error: 'Live reference limit' }); return true; }
        try {
            let bytes, type;
            if (session.mode === 'D' && /doLogin/i.test(resource.url)) { bytes = await sourceDKey(); type = 'application/octet-stream'; }
            else {
                let cached = session.cache.get(resource.url);
                if (!cached || cached.expires < Date.now()) {
                    const fetched = await readResource(resource.url, session.headers);
                    cached = { ...fetched, expires: Date.now() + 2000 };
                    if (session.cache.size >= 12) session.cache.delete(session.cache.keys().next().value);
                    session.cache.set(resource.url, cached);
                }
                bytes = cached.bytes;
                if (/^\s*#EXTM3U\b/.test(bytes.toString('utf8', 0, Math.min(128, bytes.length)))) { bytes = Buffer.from(rewrite(session, bytes.toString('utf8'), cached.url)); type = 'application/vnd.apple.mpegurl'; }
                else if (session.mode === 'B' || session.mode === 'F') { bytes = unmaskWebp(unmaskPng(bytes)); type = bytes[0] === 0x47 ? 'video/mp2t' : cached.contentType; }
                else type = bytes[0] === 0x47 || /\.(?:png|jpg|ts)(?:[?#]|$)/i.test(resource.url) ? 'video/mp2t' : cached.contentType || 'application/octet-stream';
            }
            res.writeHead(200, { 'Content-Type': type || 'application/octet-stream', 'Content-Length': bytes.length, 'Cache-Control': 'no-store' });
            res.end(req.method === 'HEAD' ? undefined : bytes);
        } catch (error) { send(502, { error: error.message }); }
        return true;
    };
}
module.exports = { createLiveTransport, unmaskPng, unmaskWebp };
