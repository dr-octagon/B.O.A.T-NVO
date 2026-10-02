// Fixed provider transports for binary request bodies and TMDB DNS resolution.
// No caller-supplied destination, cookies, Authorization or request headers.
const https = require('node:https');
const { isIP } = require('node:net');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const CONFIG = 'https://raw.githubusercontent.com/dr-octagon/Cloudstream-BronzeCloud/builds/domains.json';
let domainConfig, dnsResult;
const publicV4 = value => isIP(value) === 4 && !/^(?:0|10|127|169\.254|192\.168|172\.(?:1[6-9]|2\d|3[01])|22[4-9]|2[3-5]\d)\./.test(value);
const httpsOrigin = value => {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || isIP(url.hostname) || !url.hostname.includes('.')) throw new Error('Invalid provider origin');
    return url.origin;
};
async function cinejoyConfig() {
    if (!domainConfig || domainConfig.expires < Date.now()) {
        const promise = (async () => {
            const response = await fetch(CONFIG, { signal: AbortSignal.timeout(5000) });
            if (!response.ok) throw new Error('CineJoy config HTTP ' + response.status);
            const data = await response.json();
            return { apis: [...new Set(['https://api.shegu.st', 'https://api.shegu.xyz', data.api_url, ...(data.api_servers || [])].filter(Boolean).map(httpsOrigin))], bases: [...new Set(['https://cinejoy.to', ...(data.mirrors || []), data.base_url].filter(Boolean).map(httpsOrigin))] };
        })();
        domainConfig = { promise, expires: Date.now() + 15 * 60 * 1000 };
        promise.catch(() => { domainConfig = null; });
    }
    return domainConfig.promise;
}
async function cinejoyBinary(data) {
    const config = await cinejoyConfig();
    if (!config.apis.includes(data.api) || !config.bases.includes(data.base)) throw new Error('Unknown CineJoy origin');
    if (typeof data.data !== 'string' || data.data.length > 65536 || !/^[A-Za-z0-9_-]+={0,2}$/.test(data.data)) throw new Error('Invalid CineJoy binary body');
    const response = await fetch(data.api + '/g', { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(12000), headers: { 'User-Agent': UA, Referer: data.base + '/', Origin: data.base, 'Content-Type': 'text/plain;charset=UTF-8' }, body: Buffer.from(data.data, 'base64url') });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!response.ok) throw new Error('CineJoy API HTTP ' + response.status);
    if (bytes.length > 1024 * 1024) throw new Error('CineJoy response size limit');
    return { data: bytes.toString('base64url') };
}
async function tmdbAddress() {
    if (!dnsResult || dnsResult.expires < Date.now()) {
        const response = await fetch('https://cloudflare-dns.com/dns-query?name=api.themoviedb.org&type=A', { headers: { Accept: 'application/dns-json' }, signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error('TMDB DNS HTTP ' + response.status);
        const answer = (await response.json()).Answer?.find(record => record.type === 1 && publicV4(record.data));
        if (!answer) throw new Error('TMDB DNS address missing');
        dnsResult = { address: answer.data, expires: Date.now() + Math.max(5, Math.min(300, answer.TTL || 30)) * 1000 };
    }
    return dnsResult.address;
}
const tmdbPaths = /^(?:trending\/(?:all|movie|tv)\/(?:day|week)|(?:movie|tv)\/(?:popular|top_rated|upcoming|now_playing|on_the_air|airing_today)|discover\/(?:movie|tv)|search\/(?:multi|movie|tv)|find\/tt\d+|(?:movie|tv)\/\d+(?:\/(?:external_ids|images|credits|videos|recommendations|release_dates)|\/season\/\d+(?:\/episode\/\d+(?:\/external_ids)?)?)?)$/;
const tmdbQueries = new Set(['api_key', 'language', 'page', 'query', 'include_adult', 'external_source', 'append_to_response', 'include_image_language', 'with_networks', 'with_genres', 'sort_by', 'with_original_language', 'year', 'first_air_date_year']);
async function tmdbJson(path) {
    if (typeof path !== 'string' || path.length > 4096) throw new Error('Invalid TMDB path');
    const url = new URL('https://api.themoviedb.org/3/' + path);
    if (!tmdbPaths.test(url.pathname.slice(3)) || [...url.searchParams.keys()].some(key => !tmdbQueries.has(key)) || !/^[a-f0-9]{32}$/i.test(url.searchParams.get('api_key') || '')) throw new Error('Unsupported TMDB request');
    const address = await tmdbAddress();
    return new Promise((resolve, reject) => {
        const request = https.get(url, { headers: { Accept: 'application/json', 'User-Agent': UA }, lookup: (_hostname, options, callback) => options.all ? callback(null, [{ address, family: 4 }]) : callback(null, address, 4) }, response => {
            const chunks = []; let size = 0;
            response.on('data', chunk => { size += chunk.length; if (size > 4 * 1024 * 1024) request.destroy(new Error('TMDB response size limit')); else chunks.push(chunk); });
            response.on('error', reject);
            response.on('end', () => { try { if (response.statusCode !== 200) throw new Error('TMDB HTTP ' + response.statusCode); resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (error) { reject(error); } });
        });
        request.setTimeout(10000, () => request.destroy(new Error('TMDB timeout')));
        request.on('error', reject);
    });
}
module.exports = { cinejoyBinary, tmdbJson };
