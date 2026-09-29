/**
 * Nuvio Provider: noat
 * Built from src/noat/index.js
 * Build: v1.0.0 (Dr.Octagon / Nuvio)
 */
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/shared/quality.js
var require_quality = __commonJS({
  "src/shared/quality.js"(exports2, module2) {
    function getQualityScore(s) {
      if (!s) return 0;
      if (!s.url) return 1;
      var q = ((s.quality || "") + " " + (s.title || "") + " " + (s.name || "")).toLowerCase();
      var score = 0;
      if (/\b(4k|2160p?|uhd)\b/.test(q)) score = 2160;
      else if (/\b(2k|1440p?|qhd)\b/.test(q)) score = 1440;
      else if (/\b(1080p?|fhd)\b/.test(q)) score = 1080;
      else if (/\b(720p?|hd)\b/.test(q)) score = 720;
      else if (/\b(540p?)\b/.test(q)) score = 540;
      else if (/\b(480p?|sd)\b/.test(q)) score = 480;
      else if (/\b(360p?)\b/.test(q)) score = 360;
      else if (/\b(240p?)\b/.test(q)) score = 240;
      if (score === 0 && s.title) {
        var text = s.title.toLowerCase();
        if (/\b(4k|2160p|uhd)\b/.test(text)) score = 2160;
        else if (/\b(2k|1440p|qhd)\b/.test(text)) score = 1440;
        else if (/\b(1080p|fhd)\b/.test(text)) score = 1080;
        else if (/\b(720p|hd)\b/.test(text)) score = 720;
        else if (/\b(480p|sd)\b/.test(text)) score = 480;
        else if (/\b(360p)\b/.test(text)) score = 360;
        else if (/\b(240p)\b/.test(text)) score = 240;
      }
      if (score === 0 && s.url) {
        var u = s.url.toLowerCase();
        if (/[\/_.-](2160p?|4k)[\/_.-]/.test(u)) score = 2160;
        else if (/[\/_.-](1440p?|2k)[\/_.-]/.test(u)) score = 1440;
        else if (/[\/_.-](1080p?|fhd)[\/_.-]/.test(u)) score = 1080;
        else if (/[\/_.-](720p?|hd)[\/_.-]/.test(u)) score = 720;
        else if (/[\/_.-](480p?|sd)[\/_.-]/.test(u)) score = 480;
        else if (/[\/_.-](360p?)[\/_.-]/.test(u)) score = 360;
      }
      var isDirectMp4 = s.format === "mp4" || s.type === "mp4" || !s.isHls && s.url && (s.url.endsWith(".mp4") || s.url.includes(".mp4?"));
      if (isDirectMp4 && score > 0) score += 1;
      return score;
    }
    function sortStreamsByQuality(streams) {
      if (!Array.isArray(streams) || streams.length === 0) return streams;
      return streams.slice().sort(function(a, b) {
        return getQualityScore(b) - getQualityScore(a);
      });
    }
    module2.exports = {
      getQualityScore,
      sortStreamsByQuality
    };
  }
});

// src/shared/config.js
var require_config = __commonJS({
  "src/shared/config.js"(exports2, module2) {
    var CONFIG_URL = "https://raw.githubusercontent.com/dr-octagon/Nuvio/main/config.json";
    var CONFIG_TTL_MS = 10 * 60 * 1e3;
    var _cfg = null;
    var _cfgTime = 0;
    function _cfgLocalRead() {
      try {
        if (typeof require === "undefined") return null;
        var fs = require("fs");
        var path = require("path");
        if (!fs || !path || typeof fs.existsSync !== "function") return null;
        var dir = typeof __dirname !== "undefined" ? __dirname : "";
        var candidates = [
          path.resolve(dir, "..", "config.json"),
          // providers/<name>.js
          path.resolve(dir, "..", "..", "config.json"),
          // src/<name>/index.js
          path.resolve(dir, "config.json")
        ];
        for (var i = 0; i < candidates.length; i++) {
          if (fs.existsSync(candidates[i])) {
            return JSON.parse(fs.readFileSync(candidates[i], "utf8"));
          }
        }
      } catch (e) {
        return null;
      }
      return null;
    }
    function _cfgFetch() {
      return fetch(CONFIG_URL, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      }).then(function(res) {
        if (!res || !res.ok) throw new Error("config.json " + (res && res.status));
        if (typeof res.json === "function") return res.json();
        return res.text().then(function(t) {
          return JSON.parse(t);
        });
      });
    }
    function loadConfig() {
      var now = Date.now();
      if (_cfg && now - _cfgTime < CONFIG_TTL_MS) return Promise.resolve(_cfg);
      var local = _cfgLocalRead();
      if (local && typeof local === "object") {
        _cfg = local;
        _cfgTime = now;
        return Promise.resolve(_cfg);
      }
      return _cfgFetch().then(function(c) {
        _cfg = c && typeof c === "object" ? c : {};
        _cfgTime = now;
        return _cfg;
      }).catch(function() {
        _cfg = null;
        _cfgTime = now;
        return _cfg;
      });
    }
    function val(pathStr) {
      if (!_cfg || !pathStr) return void 0;
      var parts = String(pathStr).split(".");
      var cur = _cfg;
      for (var i = 0; i < parts.length; i++) {
        if (cur == null || typeof cur !== "object") return void 0;
        cur = cur[parts[i]];
      }
      return cur;
    }
    function wrapAll(obj, pre) {
      var out = {};
      for (var k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          if (typeof obj[k] === "function") {
            (function(name, fn) {
              out[name] = function() {
                var self = this;
                var args = arguments;
                var chain = pre ? pre() : Promise.resolve();
                return chain.then(function() {
                  return fn.apply(self, args);
                });
              };
            })(k, obj[k]);
          } else {
            out[k] = obj[k];
          }
        }
      }
      return out;
    }
    if (typeof module2 !== "undefined" && module2.exports) {
      module2.exports = { loadConfig, val, wrapAll };
    }
  }
});

// src/boat/index.js
var require_boat = __commonJS({
  "src/boat/index.js"(exports2, module2) {
    var { sortStreamsByQuality } = require_quality();
    var { loadConfig, val, wrapAll } = require_config();
    var _cfgReady = null;
    function cfgReady() {
      if (!_cfgReady) {
        _cfgReady = Promise.resolve();
        loadConfig().then(function() {
          var v;
          v = val("urls.boat.torrentio");
          if (v) TORRENTIO_API = String(v).replace(/\/+$/, "");
          v = val("urls.boat.torrentsdb");
          if (v) TORRENTSDB_API = String(v).replace(/\/+$/, "");
          v = val("urls.boat.tpb");
          if (v) TPB_API = String(v).replace(/\/+$/, "");
          v = val("urls.boat.subtitles_opensubtitles");
          if (v) OPENSUBTITLES_API = String(v).replace(/\/+$/, "");
          v = val("api_keys.tmdb");
          if (v) TMDB_API_KEY = String(v);
        }).catch(function() {
        });
      }
      return _cfgReady;
    }
    var TORRENTIO_API = "https://torrentio.strem.fun/providers=yts,eztv,rarbg,1337x,thepiratebay,kickasstorrents,torrentgalaxy,magnetdl,nyaasi,tokyotosho,anidex,rutor|sort=qualitysize|qualityfilter=scr,cam|limit=50";
    var TORRENTSDB_API = "https://torrentsdb.com/eyJsaW1pdCI6ICI1MCIsICJzb3J0IjogInF1YWxpdHlzaXplIiwgInF1YWxpdHlmaWx0ZXIiOiBbInNjciIsICJjYW0iXSwgImRlYnJpZG9wdGlvbnMiOiBbIm5vZG93bmxvYWRsaW5rcyJdfQ==";
    var TPB_API = "https://thepiratebay-plus.strem.fun";
    var OPENSUBTITLES_API = "https://opensubtitles-v3.strem.io";
    var YTS_MIRRORS = ["https://yts.lt", "https://yts.am", "https://yts.bz", "https://yts.mx"];
    var TMDB_API_KEY = "500330721680edb6d5f7f12ba7cd9023";
    var FAST_PUBLIC_TRACKERS = [
      "udp://tracker.opentrackr.org:1337/announce",
      "udp://open.stealth.si:80/announce",
      "udp://tracker.torrent.eu.org:451/announce",
      "udp://tracker.bittor.pw:1337/announce",
      "udp://public.popcorn-tracker.org:6969/announce",
      "udp://tracker.dler.org:6969/announce",
      "udp://exodus.desync.com:6969/announce",
      "udp://open.demonii.com:1337/announce"
    ];
    var DEFAULT_HEADERS = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*"
    };
    function getEffectiveTmdbApiKey() {
      if (typeof globalThis !== "undefined" && globalThis.TMDB_API_KEY) {
        return globalThis.TMDB_API_KEY;
      }
      return TMDB_API_KEY;
    }
    function fetchWithTimeout(_0) {
      return __async(this, arguments, function* (url, options = {}, timeoutMs = 8e3) {
        const hasTimeout = typeof setTimeout === "function";
        const controller = hasTimeout && typeof AbortController !== "undefined" ? new AbortController() : null;
        const timeoutId = hasTimeout && controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
        try {
          const fetchOpts = Object.assign({}, options, {
            headers: Object.assign({}, DEFAULT_HEADERS, options.headers || {})
          });
          if (controller) fetchOpts.signal = controller.signal;
          const res = yield fetch(url, fetchOpts);
          if (timeoutId && typeof clearTimeout === "function") clearTimeout(timeoutId);
          return res;
        } catch (e) {
          if (timeoutId && typeof clearTimeout === "function") clearTimeout(timeoutId);
          return null;
        }
      });
    }
    function buildMagnet(infoHash, dn, sources) {
      let trackers = [...FAST_PUBLIC_TRACKERS];
      if (Array.isArray(sources)) {
        sources.forEach((s) => {
          if (typeof s === "string" && s.toLowerCase().startsWith("tracker:")) {
            const tr = s.substring(8).trim();
            if (tr && !trackers.includes(tr)) trackers.push(tr);
          }
        });
      }
      let magnet = `magnet:?xt=urn:btih:${infoHash.toLowerCase()}`;
      if (dn) magnet += `&dn=${encodeURIComponent(dn)}`;
      trackers.forEach((tr) => {
        magnet += `&tr=${encodeURIComponent(tr)}`;
      });
      return magnet;
    }
    function extractQuality(text) {
      if (!text) return "1080p";
      const s = text.toLowerCase();
      if (/\b(4k|2160p|uhd)\b/.test(s)) return "4K UHD";
      if (/\b(2k|1440p|qhd)\b/.test(s)) return "1440p";
      if (/\b(1080p|fhd)\b/.test(s)) return "1080p";
      if (/\b(720p|hd)\b/.test(s)) return "720p";
      if (/\b(480p|sd)\b/.test(s)) return "480p";
      return "1080p";
    }
    function extractSeeders(text) {
      if (!text) return 0;
      const match = text.match(/👤\s*(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    function extractSize(text) {
      if (!text) return null;
      const match = text.match(/💾\s*([\d.]+\s*(?:GB|MB|GiB|MiB))/i);
      return match ? match[1].trim() : null;
    }
    function extractSourceSite(text) {
      if (!text) return null;
      const match = text.match(/⚙️\s*([^\n\r]+)/);
      return match ? match[1].trim() : null;
    }
    function resolveMediaMeta(id, mediaType, season, episode) {
      return __async(this, null, function* () {
        const apiKey = getEffectiveTmdbApiKey();
        const isSeries = mediaType === "tv" || mediaType === "series";
        let cleanId = String(id || "").trim();
        cleanId = cleanId.replace(/^boat:movie:/, "").replace(/^boat:series:/, "").replace(/^boat:ep:/, "").replace(/^boat:/, "");
        if (cleanId.includes(":")) {
          const parts = cleanId.split(":");
          cleanId = parts[0];
          if (parts[1] && !season) season = parseInt(parts[1], 10);
          if (parts[2] && !episode) episode = parseInt(parts[2], 10);
        }
        let imdbId = null;
        let tmdbId = null;
        let title = null;
        let year = null;
        if (cleanId.startsWith("tt")) {
          imdbId = cleanId;
          try {
            const findRes = yield fetchWithTimeout(
              `https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id&language=tr-TR`
            );
            if (findRes && findRes.ok) {
              const findData = yield findRes.json();
              const item = findData.movie_results && findData.movie_results[0] || findData.tv_results && findData.tv_results[0];
              if (item) {
                tmdbId = item.id;
                title = item.title || item.name;
                const date = item.release_date || item.first_air_date;
                if (date) year = date.substring(0, 4);
              }
            }
          } catch (e) {
          }
        } else if (/^\d+$/.test(cleanId)) {
          tmdbId = cleanId;
          const endpoint = isSeries ? `tv/${tmdbId}` : `movie/${tmdbId}`;
          try {
            const tmdbRes = yield fetchWithTimeout(
              `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&append_to_response=external_ids&language=tr-TR`
            );
            if (tmdbRes && tmdbRes.ok) {
              const data = yield tmdbRes.json();
              imdbId = data.imdb_id || data.external_ids && data.external_ids.imdb_id || null;
              title = data.title || data.name || data.original_title || data.original_name;
              const date = data.release_date || data.first_air_date;
              if (date) year = date.substring(0, 4);
            }
          } catch (e) {
          }
        }
        let episodeImdbId = null;
        if (isSeries && tmdbId && season && episode) {
          try {
            const epRes = yield fetchWithTimeout(
              `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}/episode/${episode}/external_ids?api_key=${apiKey}`
            );
            if (epRes && epRes.ok) {
              const epData = yield epRes.json();
              if (epData.imdb_id) episodeImdbId = epData.imdb_id;
            }
          } catch (e) {
          }
        }
        return {
          imdbId: imdbId || cleanId,
          episodeImdbId,
          tmdbId,
          title,
          year,
          season: season || (isSeries ? 1 : null),
          episode: episode || (isSeries ? 1 : null),
          isSeries
        };
      });
    }
    function fetchOpenSubtitles(meta) {
      return __async(this, null, function* () {
        if (!meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
        try {
          const streamTarget = meta.isSeries ? `series/${meta.imdbId}:${meta.season}:${meta.episode}.json` : `movie/${meta.imdbId}.json`;
          const url = `${OPENSUBTITLES_API}/subtitles/${streamTarget}`;
          const res = yield fetchWithTimeout(url, {}, 7e3);
          if (!res || !res.ok) return [];
          const data = yield res.json();
          if (!data || !Array.isArray(data.subtitles)) return [];
          const subs = [];
          const seen = /* @__PURE__ */ new Set();
          data.subtitles.forEach((s, idx) => {
            if (!s.url || seen.has(s.url)) return;
            seen.add(s.url);
            const langLower = (s.lang || "").toLowerCase();
            const isTr = langLower === "tur" || langLower === "tr";
            const isEn = langLower === "eng" || langLower === "en";
            let label = s.name || (isTr ? "T\xFCrk\xE7e" : isEn ? "\u0130ngilizce" : langLower.toUpperCase());
            if (isTr) label = `\u{1F1F9}\u{1F1F7} ${label}`;
            else if (isEn) label = `\u{1F1EC}\u{1F1E7} ${label}`;
            subs.push({
              id: `os_${langLower}_${idx + 1}`,
              url: s.url,
              file: s.url,
              link: s.url,
              lang: s.lang || "und",
              language: isTr ? "tr" : isEn ? "en" : langLower,
              label,
              name: label,
              title: label,
              format: s.url.endsWith(".vtt") ? "vtt" : "srt",
              type: s.url.endsWith(".vtt") ? "text/vtt" : "application/x-subrip",
              mimeType: s.url.endsWith(".vtt") ? "text/vtt" : "application/x-subrip",
              isTurkish: isTr
            });
          });
          subs.sort((a, b) => {
            if (a.isTurkish && !b.isTurkish) return -1;
            if (!a.isTurkish && b.isTurkish) return 1;
            return 0;
          });
          return subs;
        } catch (e) {
          return [];
        }
      });
    }
    function fetchTorrentioStreams(meta) {
      return __async(this, null, function* () {
        if (!meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
        try {
          const streamTarget = meta.isSeries ? `series/${meta.imdbId}:${meta.season}:${meta.episode}.json` : `movie/${meta.imdbId}.json`;
          const url = `${TORRENTIO_API}/stream/${streamTarget}`;
          const res = yield fetchWithTimeout(url, {}, 9e3);
          if (!res || !res.ok) return [];
          const data = yield res.json();
          if (!data || !Array.isArray(data.streams)) return [];
          const results = [];
          data.streams.forEach((s) => {
            let streamUrl = s.url;
            if (!streamUrl && s.infoHash) {
              streamUrl = buildMagnet(s.infoHash, s.title || meta.title, s.sources);
            }
            if (!streamUrl) return;
            const fullText = `${s.name || ""}
${s.title || ""}`;
            const quality = extractQuality(fullText);
            const seeders = extractSeeders(fullText);
            const size = extractSize(fullText);
            const site = extractSourceSite(fullText) || "Torrentio";
            let cleanTitle = (s.title || "").split("\n")[0] || meta.title || "Torrent Ak\u0131\u015F\u0131";
            const sizeTag = size ? ` [${size}]` : "";
            const seedTag = seeders > 0 ? ` [\u{1F464} ${seeders}]` : "";
            const isTr = /turkish|turkce|\btr\b|dublaj/i.test(cleanTitle);
            const trTag = isTr ? " \u{1F1F9}\u{1F1F7}" : "";
            results.push({
              name: `${cleanTitle}${sizeTag}${seedTag}${trTag}`,
              title: `\u231C B.O.A.T \u{1F9F2} \u231F | ${cleanTitle} [${quality}]${sizeTag}${seedTag} [${site}]${trTag}`,
              url: streamUrl,
              quality,
              size,
              seeders,
              type: "torrent",
              infoHash: s.infoHash,
              provider: `Torrentio (${site})`,
              contentLanguage: isTr ? "tr" : "en",
              behaviorHints: { notWebReady: false }
            });
          });
          return results;
        } catch (e) {
          return [];
        }
      });
    }
    function fetchTorrentsDbStreams(meta) {
      return __async(this, null, function* () {
        if (!meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
        try {
          const streamTarget = meta.isSeries ? `series/${meta.imdbId}:${meta.season}:${meta.episode}.json` : `movie/${meta.imdbId}.json`;
          const url = `${TORRENTSDB_API}/stream/${streamTarget}`;
          const res = yield fetchWithTimeout(url, {}, 9e3);
          if (!res || !res.ok) return [];
          const data = yield res.json();
          if (!data || !Array.isArray(data.streams)) return [];
          const results = [];
          data.streams.forEach((s) => {
            let streamUrl = s.url;
            if (!streamUrl && s.infoHash) {
              streamUrl = buildMagnet(s.infoHash, s.title || meta.title, s.sources);
            }
            if (!streamUrl) return;
            const fullText = `${s.name || ""}
${s.title || ""}`;
            const quality = extractQuality(fullText);
            const seeders = extractSeeders(fullText);
            const size = extractSize(fullText);
            const site = extractSourceSite(fullText) || "TorrentsDB";
            let cleanTitle = (s.title || "").split("\n")[0] || meta.title || "TorrentsDB Ak\u0131\u015F\u0131";
            const sizeTag = size ? ` [${size}]` : "";
            const seedTag = seeders > 0 ? ` [\u{1F464} ${seeders}]` : "";
            const isTr = /turkish|turkce|\btr\b|dublaj/i.test(cleanTitle);
            const trTag = isTr ? " \u{1F1F9}\u{1F1F7}" : "";
            results.push({
              name: `${cleanTitle}${sizeTag}${seedTag}${trTag}`,
              title: `\u231C B.O.A.T \u{1F9F2} \u231F | ${cleanTitle} [${quality}]${sizeTag}${seedTag} [${site}]${trTag}`,
              url: streamUrl,
              quality,
              size,
              seeders,
              type: "torrent",
              infoHash: s.infoHash,
              provider: `TorrentsDB (${site})`,
              contentLanguage: isTr ? "tr" : "en",
              behaviorHints: { notWebReady: false }
            });
          });
          return results;
        } catch (e) {
          return [];
        }
      });
    }
    function fetchTpbStreams(meta) {
      return __async(this, null, function* () {
        if (!meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
        try {
          const streamTarget = meta.isSeries ? `series/${meta.imdbId}:${meta.season}:${meta.episode}.json` : `movie/${meta.imdbId}.json`;
          const url = `${TPB_API}/stream/${streamTarget}`;
          const res = yield fetchWithTimeout(url, {}, 8e3);
          if (!res || !res.ok) return [];
          const data = yield res.json();
          if (!data || !Array.isArray(data.streams)) return [];
          const results = [];
          data.streams.forEach((s) => {
            let streamUrl = s.url;
            if (!streamUrl && s.infoHash) {
              streamUrl = buildMagnet(s.infoHash, s.title || meta.title, s.sources);
            }
            if (!streamUrl) return;
            const fullText = `${s.name || ""}
${s.title || ""}`;
            const quality = extractQuality(fullText);
            const seeders = extractSeeders(fullText);
            const size = extractSize(fullText);
            let cleanTitle = (s.title || "").split("\n")[0] || meta.title || "TPB Ak\u0131\u015F\u0131";
            const sizeTag = size ? ` [${size}]` : "";
            const seedTag = seeders > 0 ? ` [\u{1F464} ${seeders}]` : "";
            results.push({
              name: `${cleanTitle}${sizeTag}${seedTag}`,
              title: `\u231C B.O.A.T \u{1F9F2} \u231F | ${cleanTitle} [${quality}]${sizeTag}${seedTag} [ThePirateBay]`,
              url: streamUrl,
              quality,
              size,
              seeders,
              type: "torrent",
              infoHash: s.infoHash,
              provider: "ThePirateBay+",
              behaviorHints: { notWebReady: false }
            });
          });
          return results;
        } catch (e) {
          return [];
        }
      });
    }
    function fetchYtsStreams(meta) {
      return __async(this, null, function* () {
        if (meta.isSeries || !meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
        for (const mirror of YTS_MIRRORS) {
          try {
            const url = `${mirror}/api/v2/movie_details.json?imdb_id=${meta.imdbId}&with_images=false`;
            const res = yield fetchWithTimeout(url, {}, 7e3);
            if (!res || !res.ok) continue;
            const data = yield res.json();
            if (!data || !data.data || !data.data.movie || !Array.isArray(data.data.movie.torrents)) continue;
            const movie = data.data.movie;
            const movieTitle = movie.title || meta.title || "YTS Film";
            const results = [];
            movie.torrents.forEach((t) => {
              if (!t.hash) return;
              const magnet = buildMagnet(t.hash, `${movieTitle} [${t.quality}] [YTS]`);
              const qLabel = t.quality === "2160p" ? "4K UHD" : t.quality;
              const typeLabel = t.type ? ` [${t.type.toUpperCase()}]` : "";
              const sizeLabel = t.size ? ` [${t.size}]` : "";
              results.push({
                name: `${movieTitle} [${qLabel}]${typeLabel}${sizeLabel} [YTS]`,
                title: `\u231C B.O.A.T \u{1F9F2} \u231F | ${movieTitle} [${qLabel}]${typeLabel}${sizeLabel} [YTS/TorrentFilm]`,
                url: magnet,
                quality: qLabel,
                size: t.size,
                seeders: t.seeds || 10,
                type: "torrent",
                infoHash: t.hash,
                provider: "YTS/TorrentFilm",
                behaviorHints: { notWebReady: false }
              });
            });
            if (results.length > 0) return results;
          } catch (e) {
          }
        }
        return [];
      });
    }
    function getStreams(id, mediaType, season, episode) {
      return __async(this, null, function* () {
        try {
          const meta = yield resolveMediaMeta(id, mediaType, season, episode);
          const [
            subtitlesSettled,
            torrentioSettled,
            torrentsDbSettled,
            tpbSettled,
            ytsSettled
          ] = yield Promise.allSettled([
            fetchOpenSubtitles(meta),
            fetchTorrentioStreams(meta),
            fetchTorrentsDbStreams(meta),
            fetchTpbStreams(meta),
            fetchYtsStreams(meta)
          ]);
          const subtitles = subtitlesSettled.status === "fulfilled" && Array.isArray(subtitlesSettled.value) ? subtitlesSettled.value : [];
          let allStreams = [];
          if (torrentioSettled.status === "fulfilled" && Array.isArray(torrentioSettled.value)) {
            allStreams = allStreams.concat(torrentioSettled.value);
          }
          if (torrentsDbSettled.status === "fulfilled" && Array.isArray(torrentsDbSettled.value)) {
            allStreams = allStreams.concat(torrentsDbSettled.value);
          }
          if (tpbSettled.status === "fulfilled" && Array.isArray(tpbSettled.value)) {
            allStreams = allStreams.concat(tpbSettled.value);
          }
          if (ytsSettled.status === "fulfilled" && Array.isArray(ytsSettled.value)) {
            allStreams = allStreams.concat(ytsSettled.value);
          }
          const seen = /* @__PURE__ */ new Set();
          const deduplicatedStreams = [];
          for (const s of allStreams) {
            const key = s.infoHash ? s.infoHash.toLowerCase() : s.url;
            if (!key || seen.has(key)) continue;
            seen.add(key);
            s.subtitles = subtitles;
            deduplicatedStreams.push(s);
          }
          return sortStreamsByQuality(deduplicatedStreams);
        } catch (err) {
          return [];
        }
      });
    }
    function getSubtitles(id, mediaType, season, episode) {
      return __async(this, null, function* () {
        try {
          const meta = yield resolveMediaMeta(id, mediaType, season, episode);
          return yield fetchOpenSubtitles(meta);
        } catch (e) {
          return [];
        }
      });
    }
    function getCatalog(_0, _1) {
      return __async(this, arguments, function* (type, id, extra = {}) {
        try {
          const apiKey = getEffectiveTmdbApiKey();
          const isSeries = type === "series" || type === "tv" || id === "boat_popular_series";
          const query = extra && extra.search ? extra.search.trim() : null;
          let url = "";
          if (query) {
            const ep = isSeries ? "search/tv" : "search/movie";
            url = `https://api.themoviedb.org/3/${ep}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=tr-TR&page=1`;
          } else {
            const ep = isSeries ? "trending/tv/day" : "trending/movie/day";
            url = `https://api.themoviedb.org/3/${ep}?api_key=${apiKey}&language=tr-TR&page=1`;
          }
          const res = yield fetchWithTimeout(url, {}, 8e3);
          if (!res || !res.ok) return { metas: [] };
          const data = yield res.json();
          if (!data || !Array.isArray(data.results)) return { metas: [] };
          const metas = data.results.map((item) => {
            const title = item.title || item.name || item.original_title || item.original_name;
            const date = item.release_date || item.first_air_date || "";
            const yearStr = date ? ` (${date.substring(0, 4)})` : "";
            const isMovieItem = !isSeries && !item.first_air_date;
            return {
              id: isMovieItem ? `boat:movie:${item.id}` : `boat:series:${item.id}`,
              type: isMovieItem ? "movie" : "series",
              name: `${title}${yearStr}`,
              poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
              background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
              description: item.overview || `${title} \u2014 B.O.A.T 4K UHD & 1080p Kayna\u011F\u0131`,
              genres: ["Pop\xFCler", "B.O.A.T", isMovieItem ? "Film" : "Dizi"]
            };
          });
          return { metas };
        } catch (e) {
          return { metas: [] };
        }
      });
    }
    function getMeta(args) {
      return __async(this, null, function* () {
        try {
          const apiKey = getEffectiveTmdbApiKey();
          const rawId = typeof args === "string" ? args : args && args.id ? args.id : "";
          if (!rawId) return { meta: null };
          let cleanId = rawId.replace(/^boat:movie:/, "").replace(/^boat:series:/, "").replace(/^boat:/, "");
          const isSeries = rawId.includes(":series:") || args && args.type === "series";
          const endpoint = isSeries ? `tv/${cleanId}` : `movie/${cleanId}`;
          const res = yield fetchWithTimeout(
            `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&append_to_response=external_ids&language=tr-TR`,
            {},
            8e3
          );
          if (!res || !res.ok) return { meta: null };
          const d = yield res.json();
          const title = d.title || d.name || "B.O.A.T \u0130\xE7eri\u011Fi";
          const poster = d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null;
          const bg = d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : null;
          const videos = [];
          if (isSeries && Array.isArray(d.seasons)) {
            d.seasons.forEach((s) => {
              if (s.season_number <= 0) return;
              const sNum = s.season_number;
              const epCount = s.episode_count || 10;
              for (let e = 1; e <= epCount; e++) {
                videos.push({
                  id: `boat:ep:${cleanId}:${sNum}:${e}`,
                  title: `${sNum}. Sezon ${e}. B\xF6l\xFCm`,
                  season: sNum,
                  episode: e
                });
              }
            });
          }
          return {
            meta: {
              id: rawId,
              type: isSeries ? "series" : "movie",
              name: title,
              poster,
              background: bg,
              description: d.overview || `${title} \u2014 B.O.A.T 4K UHD & 1080p`,
              genres: d.genres ? d.genres.map((g) => g.name) : ["B.O.A.T"],
              videos: videos.length > 0 ? videos : void 0
            }
          };
        } catch (e) {
          return { meta: null };
        }
      });
    }
    if (typeof module2 !== "undefined") {
      module2.exports = wrapAll({
        getStreams,
        getSubtitles,
        getCatalog,
        getMeta
      }, cfgReady);
    }
    if (typeof globalThis !== "undefined") {
      globalThis.getStreams = getStreams;
      globalThis.getSubtitles = getSubtitles;
      globalThis.getCatalog = getCatalog;
      globalThis.getMeta = getMeta;
    }
  }
});

// src/noat/index.js
var boat = require_boat();
module.exports = boat;
if (typeof globalThis !== "undefined") {
  if (boat.getStreams) globalThis.getStreams = boat.getStreams;
  if (boat.getSubtitles) globalThis.getSubtitles = boat.getSubtitles;
  if (boat.getCatalog) globalThis.getCatalog = boat.getCatalog;
  if (boat.getMeta) globalThis.getMeta = boat.getMeta;
}

if (typeof globalThis !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    if (module.exports.getStreams) globalThis.getStreams = module.exports.getStreams;
    if (module.exports.getCatalog) globalThis.getCatalog = module.exports.getCatalog;
    if (module.exports.getMeta) globalThis.getMeta = module.exports.getMeta;
    if (module.exports.getSubtitles) globalThis.getSubtitles = module.exports.getSubtitles;
}

