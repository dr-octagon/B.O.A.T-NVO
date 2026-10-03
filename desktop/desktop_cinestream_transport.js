const http=require('node:http');
const https=require('node:https');
const dns=require('node:dns').promises;
const {isIP}=require('node:net');
const {gunzipSync,inflateSync,brotliDecompressSync}=require('node:zlib');
// Loopback-only transport for Desktop's fetch, which ignores AbortSignal.
// Every destination and redirect is checked, then DNS is pinned to a public IP.
function publicV4(value){
    if(isIP(value)!==4)return false;
    const [a,b]=value.split('.').map(Number);
    return !(a===0 || a===10 || a===127 || a>=224 || a===169&&b===254 || a===172&&b>=16&&b<=31 || a===192&&(b===168 || b===0) || a===100&&b>=64&&b<=127 || a===198&&(b===18 || b===19 || b===51) || a===203&&b===0);
}
function destination(value){
    const url=new URL(value);
    if(!['https:','http:'].includes(url.protocol) || url.username || url.password || url.port || isIP(url.hostname) || !url.hostname.includes('.') || /(?:^|\.)(?:localhost|local|internal|lan|home|test|invalid)$/.test(url.hostname))throw Error('Invalid CineStream destination');
    return url;
}
async function cineStreamFetch(data){
    if(typeof data.url!=='string' || data.url.length>16384)throw Error('Invalid CineStream URL');
    const initial=destination(data.url),method=String(data.method || 'GET').toUpperCase();
    if(!['GET','HEAD','POST'].includes(method))throw Error('Unsupported CineStream method');
    if(typeof data.body!=='string' && data.body!=null || String(data.body || '').length>256*1024)throw Error('Invalid CineStream body');
    if(data.headers!=null && (typeof data.headers!=='object' || Array.isArray(data.headers)))throw Error('Invalid CineStream headers');
    const headers={};
    for(const [key,value] of Object.entries(data.headers || {})){
        if(!/^[a-zA-Z0-9!#$%&'*+.^_`|~-]+$/.test(key) || typeof value!=='string' || /[\r\n]/.test(value) || value.length>16384)throw Error('Invalid CineStream header');
        if(/^(?:host|connection|content-length|transfer-encoding|proxy-.*|forwarded|x-forwarded-.*)$/i.test(key))continue;
        headers[key]=value;
    }
    for(const key of Object.keys(headers))if(/^accept-encoding$/i.test(key))delete headers[key];
    headers['Accept-Encoding']='identity';
    const ms=Math.max(1,Math.min(12000,Number(data.timeoutMs) || 10000)),end=Date.now()+ms;
    async function visit(url,method,body,headers,depth){
        destination(url.href);
        let timer;
        const addresses=await Promise.race([dns.lookup(url.hostname,{all:true}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('CineStream DNS timeout')),Math.max(1,end-Date.now()));})]).finally(()=>clearTimeout(timer));
        if(!addresses.length || addresses.some(item=>item.family===4&&!publicV4(item.address)))throw Error('Non-public CineStream destination');
        const address=addresses.find(item=>item.family===4&&publicV4(item.address));
        if(!address)throw Error('CineStream requires a public IPv4 destination');
        if(Date.now()>=end)throw Error('CineStream request timeout');
        const response=await new Promise((resolve,reject)=>{
            const req=(url.protocol==='https:'?https:http).request(url,{method,headers,lookup:(_host,options,callback)=>options.all?callback(null,[address]):callback(null,address.address,address.family)},res=>{
                const chunks=[];let size=0;
                res.on('data',chunk=>{size+=chunk.length;if(size>512*1024)req.destroy(Error('CineStream response size limit'));else chunks.push(chunk);});
                res.on('error',reject);
                res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,bytes:Buffer.concat(chunks)}));
            });
            const timeout=setTimeout(()=>req.destroy(Error('CineStream request timeout')),Math.max(1,end-Date.now()));
            req.on('close',()=>clearTimeout(timeout));req.on('error',reject);
            if(body!=null && method==='POST')req.write(body);
            req.end();
        });
        if([301,302,303,307,308].includes(response.status) && response.headers.location && data.redirect!=='manual'){
            if(depth>=6)throw Error('CineStream redirect limit');
            const next=destination(new URL(response.headers.location,url).href),nextHeaders={...headers};
            if(next.origin!==url.origin)for(const key of Object.keys(nextHeaders))if(/^(?:cookie|authorization|x-.*(?:token|key))$/i.test(key))delete nextHeaders[key];
            const nextMethod=response.status===303 || [301,302].includes(response.status)&&method==='POST'?'GET':method;
            return visit(next,nextMethod,nextMethod==='GET'?null:body,nextHeaders,depth+1);
        }
        const decompress={'gzip':gunzipSync,'deflate':inflateSync,'br':brotliDecompressSync}[response.headers['content-encoding']];
        const bytes=decompress?decompress(response.bytes,{maxOutputLength:512*1024}):response.bytes;
        return {url:url.href,status:response.status,headers:response.headers,bodyBase64:bytes.toString('base64')};
    }
    return visit(initial,method,data.body,headers,0);
}
module.exports={cineStreamFetch,destination,publicV4};
