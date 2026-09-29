/**
 * Nuvio Provider: noat
 * Built from src/noat/index.js
 * Build: v1.0.0 (Dr.Octagon / Nuvio)
 */
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
    function parseSizeBytes(s) {
      if (!s) return 0;
      var raw = "";
      if (typeof s === "object") {
        raw = (s.size || "") + " " + (s.name || "") + " " + (s.title || "");
      } else if (typeof s === "string") {
        raw = s;
      }
      var m = raw.match(/([\d.]+)\s*(TB|TIB|GB|GIB|MB|MIB|KB|KIB)\b/i);
      if (!m) return 0;
      var num = parseFloat(m[1]);
      if (isNaN(num)) return 0;
      var unit = m[2].toUpperCase();
      if (unit === "TB" || unit === "TIB") return num * 1099511627776;
      if (unit === "GB" || unit === "GIB") return num * 1073741824;
      if (unit === "MB" || unit === "MIB") return num * 1048576;
      if (unit === "KB" || unit === "KIB") return num * 1024;
      return num;
    }
    function sortStreamsByQuality2(streams) {
      if (!Array.isArray(streams) || streams.length === 0) return streams;
      return streams.slice().sort(function(a, b) {
        var scoreDiff = getQualityScore(b) - getQualityScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        var sizeDiff = parseSizeBytes(b) - parseSizeBytes(a);
        if (sizeDiff !== 0) return sizeDiff;
        var seedDiff = (b.seeders || 0) - (a.seeders || 0);
        if (seedDiff !== 0) return seedDiff;
        return 0;
      });
    }
    module2.exports = {
      getQualityScore,
      parseSizeBytes,
      sortStreamsByQuality: sortStreamsByQuality2
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
    function loadConfig2() {
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
    function val2(pathStr) {
      if (!_cfg || !pathStr) return void 0;
      var parts = String(pathStr).split(".");
      var cur = _cfg;
      for (var i = 0; i < parts.length; i++) {
        if (cur == null || typeof cur !== "object") return void 0;
        cur = cur[parts[i]];
      }
      return cur;
    }
    function wrapAll2(obj, pre) {
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
      module2.exports = { loadConfig: loadConfig2, val: val2, wrapAll: wrapAll2 };
    }
  }
});

// src/shared/tmdb.js
var require_tmdb = __commonJS({
  "src/shared/tmdb.js"(exports2, module2) {
    var TMDB_DEFAULT_KEY = "500330721680edb6d5f7f12ba7cd9023";
    var TMDB_BASE_URL2 = "https://api.themoviedb.org/3";
    var GITHUB_RAW_BASE = "https://raw.githubusercontent.com/dr-octagon/Nuvio/main";
    var CINEMETA_BASE = "https://v3-cinemeta.strem.io";
    function getApiKey2() {
      if (typeof globalThis !== "undefined" && globalThis.TMDB_API_KEY) {
        return globalThis.TMDB_API_KEY;
      }
      return TMDB_DEFAULT_KEY;
    }
    async function fetchWithTimeout(url, options, timeoutMs) {
      options = options || {};
      timeoutMs = timeoutMs || 3e3;
      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = null;
      if (controller) {
        timer = setTimeout(function() {
          controller.abort();
        }, timeoutMs);
        options.signal = controller.signal;
      }
      try {
        var res = await fetch(url, options);
        if (timer) clearTimeout(timer);
        return res;
      } catch (e) {
        if (timer) clearTimeout(timer);
        return null;
      }
    }
    async function getMediaDetails2(id, mediaType) {
      var rawId = String(id || "").trim();
      var cleanId = rawId;
      cleanId = cleanId.replace(/^tmdb:/, "").replace(/^boat:movie:/, "").replace(/^boat:series:/, "").replace(/^boat:/, "").replace(/^noat:/, "").replace(/^hdfilmcehennemi:/, "");
      if (cleanId.includes(":")) {
        cleanId = cleanId.split(":")[0];
      }
      var isTv = mediaType === "tv" || mediaType === "series";
      var type = isTv ? "series" : "movie";
      var tmdbType = isTv ? "tv" : "movie";
      var isImdb = cleanId.startsWith("tt");
      var result = {
        tmdbId: isImdb ? "" : cleanId,
        title: "",
        originalTitle: "",
        year: null,
        type: tmdbType,
        details: null
      };
      if (!cleanId) return result;
      try {
        var ghUrl = `${GITHUB_RAW_BASE}/meta/${type}/${cleanId}.json`;
        var ghRes = await fetchWithTimeout(ghUrl, { headers: { "Accept": "application/json" } }, 2500);
        if (ghRes && ghRes.ok) {
          var ghData = await ghRes.json();
          var meta = ghData && ghData.meta;
          if (meta && meta.name) {
            result.title = String(meta.name).replace(/\s*\(\d{4}\)$/, "").trim();
            result.originalTitle = meta.originalName || meta.originalTitle || result.title;
            var y = meta.releaseInfo ? parseInt(meta.releaseInfo, 10) : meta.year ? parseInt(meta.year, 10) : null;
            result.year = y && !isNaN(y) ? y : null;
            if (meta.tmdbId) result.tmdbId = String(meta.tmdbId);
            result.details = meta;
            return result;
          }
        }
      } catch (e) {
      }
      if (isImdb) {
        try {
          var cmUrl = `${CINEMETA_BASE}/meta/${type}/${cleanId}.json`;
          var cmRes = await fetchWithTimeout(cmUrl, { headers: { "Accept": "application/json" } }, 2500);
          if (cmRes && cmRes.ok) {
            var cmData = await cmRes.json();
            var cmMeta = cmData && cmData.meta;
            if (cmMeta && cmMeta.name) {
              result.title = String(cmMeta.name).trim();
              result.originalTitle = String(cmMeta.name).trim();
              var cy = cmMeta.year ? parseInt(cmMeta.year, 10) : null;
              result.year = cy && !isNaN(cy) ? cy : null;
              if (cmMeta.moviedb_id) result.tmdbId = String(cmMeta.moviedb_id);
              result.details = cmMeta;
              return result;
            }
          }
        } catch (e) {
        }
      }
      try {
        var apiKey = getApiKey2();
        var tmdbId = isImdb ? null : cleanId;
        if (isImdb) {
          var findUrl = `${TMDB_BASE_URL2}/find/${cleanId}?api_key=${apiKey}&external_source=imdb_id`;
          var findRes = await fetchWithTimeout(findUrl, {}, 2500);
          if (findRes && findRes.ok) {
            var fData = await findRes.json();
            var item = tmdbType === "tv" ? fData.tv_results && fData.tv_results[0] : fData.movie_results && fData.movie_results[0];
            if (item && item.id) {
              tmdbId = String(item.id);
              result.details = item;
            }
          }
        }
        if (tmdbId) {
          var detUrl = `${TMDB_BASE_URL2}/${tmdbType}/${tmdbId}?api_key=${apiKey}&language=tr-TR`;
          var detRes = await fetchWithTimeout(detUrl, {}, 2500);
          if (detRes && detRes.ok) {
            var d = await detRes.json();
            result.tmdbId = String(tmdbId);
            result.title = d.title || d.name || "";
            result.originalTitle = d.original_title || d.original_name || "";
            var releaseDate = d.release_date || d.first_air_date || "";
            var dy = releaseDate ? parseInt(releaseDate.slice(0, 4), 10) : null;
            result.year = dy && !isNaN(dy) ? dy : null;
            result.details = d;
            return result;
          }
        }
      } catch (e) {
      }
      return result;
    }
    module2.exports = {
      getApiKey: getApiKey2,
      getMediaDetails: getMediaDetails2,
      TMDB_BASE_URL: TMDB_BASE_URL2,
      GITHUB_RAW_BASE,
      CINEMETA_BASE
    };
  }
});

// src/shared/extractors/setplay.js
var require_setplay = __commonJS({
  "src/shared/extractors/setplay.js"(exports2, module2) {
    var DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    function base64ToBytes(b64) {
      if (typeof Buffer !== "undefined") {
        return Array.from(Buffer.from(b64, "base64"));
      }
      if (typeof atob !== "undefined") {
        const bin = atob(b64);
        const bytes = new Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          bytes[i] = bin.charCodeAt(i);
        }
        return bytes;
      }
      return [];
    }
    function xorDecrypt(t, n) {
      try {
        const tBytes = base64ToBytes(t);
        const nBytes = base64ToBytes(n);
        if (tBytes.length === 0 || nBytes.length === 0) return "";
        let result = "";
        for (let i = 0; i < tBytes.length; i++) {
          const dec = tBytes[i] ^ nBytes[i % nBytes.length];
          result += String.fromCharCode(dec);
        }
        return result;
      } catch (e) {
        return "";
      }
    }
    async function extractSetPlay(embedUrl, referer = "https://www.hdfilmcehennemi.land/") {
      try {
        if (!embedUrl || !embedUrl.startsWith("http")) return null;
        const res = await fetch(embedUrl, {
          headers: {
            "User-Agent": DEFAULT_USER_AGENT,
            "Referer": referer
          }
        });
        if (!res.ok) return null;
        const html = await res.text();
        const cerceveMatch = html.match(/SPG\.cerceve\([^,]+,\s*["']([^"']+)["'],\s*["']([^"']+)["']\)/);
        if (!cerceveMatch) return null;
        const cipher = cerceveMatch[1];
        const key = cerceveMatch[2];
        const decrypted = xorDecrypt(cipher, key);
        if (!decrypted) return null;
        const fastPlayUrl = decrypted.split("|")[0].trim();
        if (fastPlayUrl && fastPlayUrl.startsWith("http")) {
          return fastPlayUrl;
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    module2.exports = {
      extractSetPlay,
      xorDecrypt
    };
  }
});

// src/shared/extractors/fastplay.js
var require_fastplay = __commonJS({
  "src/shared/extractors/fastplay.js"(exports2, module2) {
    var DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    function generateXSpToken(sp, spT) {
      const n = BigInt(spT || Math.floor(Date.now() / 1e3));
      const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
      const b36 = BigInt(36);
      const b0 = BigInt(0);
      let num = BigInt(Math.floor(Math.random() * 2176782336));
      let rStr = "";
      while (num > b0) {
        rStr = chars[Number(num % b36)] + rStr;
        num = num / b36;
      }
      if (!rStr) rStr = "0";
      const text = `${sp}|${n}|${rStr}`;
      let h = BigInt(2166136261);
      const prime = BigInt(16777619);
      const mask = BigInt("0xFFFFFFFF");
      for (let i = 0; i < text.length; i++) {
        h = h ^ BigInt(text.charCodeAt(i));
        h = h * prime & mask;
      }
      const hashHex = h.toString(16);
      return `${n}.${rStr}.${hashHex}`;
    }
    async function extractFastPlay(fastPlayUrl, referer = "https://setplay.shop/") {
      try {
        if (!fastPlayUrl || !fastPlayUrl.startsWith("http")) return null;
        const res = await fetch(fastPlayUrl, {
          headers: {
            "User-Agent": DEFAULT_USER_AGENT,
            "Referer": referer
          }
        });
        if (!res.ok) return null;
        const html = await res.text();
        const spMatch = html.match(/"sp"\s*:\s*"([^"]+)"/);
        const spTMatch = html.match(/"spT"\s*:\s*(\d+)/);
        const streamMatch = html.match(/(?:stream|src)\s*:\s*["']([^"']+)["']/);
        if (!streamMatch) return null;
        const sp = spMatch ? spMatch[1] : "";
        const spT = spTMatch ? parseInt(spTMatch[1], 10) : Math.floor(Date.now() / 1e3);
        const streamPath = streamMatch[1];
        const manifestUrl = streamPath.startsWith("http") ? streamPath : `https://fastplay.mom${streamPath}`;
        const token = generateXSpToken(sp, spT);
        const subtitles = [];
        const tracksMatch = html.match(/(?:tracks|subtitles)\s*:\s*(\[[^\]]+\])/);
        if (tracksMatch) {
          try {
            const tracks = JSON.parse(tracksMatch[1]);
            for (const t of tracks) {
              if (!t || !t.file || t.kind === "thumbnails") continue;
              let fileUrl = t.file.replace(/\\\//g, "/");
              if (!fileUrl.startsWith("http")) continue;
              const label = t.label || (t.lang === "tur" ? "T\xFCrk\xE7e" : "\u0130ngilizce");
              const isForced = !!t.forced;
              const subName = isForced ? `${label} (Zorunlu)` : label;
              const langCode = t.lang || (label.toLowerCase().includes("t\xFCrk") ? "tr" : "en");
              subtitles.push({
                url: fileUrl,
                language: langCode,
                name: subName
              });
            }
          } catch (err) {
          }
        }
        const headers = {
          "Referer": "https://fastplay.mom/",
          "User-Agent": DEFAULT_USER_AGENT,
          "X-Sp": token
        };
        return {
          url: manifestUrl,
          headers,
          subtitles
        };
      } catch (e) {
        return null;
      }
    }
    module2.exports = {
      extractFastPlay,
      generateXSpToken
    };
  }
});

// src/noat/providers/hdfilmcehennemi.js
var require_hdfilmcehennemi = __commonJS({
  "src/noat/providers/hdfilmcehennemi.js"(exports2, module2) {
    var cheerio = require("cheerio");
    var { extractSetPlay } = require_setplay();
    var { extractFastPlay } = require_fastplay();
    var BASE_URL = "https://www.hdfilmcehennemi.land";
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    function cleanText(str) {
      if (!str) return "";
      let s = str.toString().toLowerCase();
      try {
        if (typeof s.normalize === "function") {
          s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }
      } catch (e) {
      }
      return s.replace(/[ıİ]/g, "i").replace(/[üÜ]/g, "u").replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[ğĞ]/g, "g").replace(/[çÇ]/g, "c").replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
    }
    async function searchHDF(query) {
      if (!query || !query.trim()) return [];
      try {
        const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(query.trim())}`;
        const res = await fetch(searchUrl, {
          headers: {
            "User-Agent": USER_AGENT,
            "Referer": `${BASE_URL}/`
          }
        });
        if (!res.ok) return [];
        const html = await res.text();
        const $ = cheerio.load(html);
        const results = [];
        $("a.poster, .poster, div.card, article").each((i, el) => {
          const $el = $(el);
          let href = $el.attr("href") || $el.find("a").attr("href");
          if (!href) return;
          if (href.startsWith("/")) href = `${BASE_URL}${href}`;
          if (href.endsWith("/film/") || href.endsWith("/dizi/") || href.includes("/tur/") || href.includes("/page/")) {
            return;
          }
          const title = $el.find(".poster-title, .title, h2, h3").text().trim() || $el.attr("title") || $el.find("img").attr("alt") || "";
          if (!title) return;
          const isSeries = href.includes("/dizi/") || href.includes("/bolum/");
          if (!results.find((r) => r.url === href)) {
            results.push({
              title,
              url: href,
              isSeries
            });
          }
        });
        return results;
      } catch (e) {
        return [];
      }
    }
    function rankCandidates(results, title, originalTitle, isTv, year) {
      if (!results || results.length === 0) return [];
      const targetTypeMatches = results.filter((r) => isTv ? r.isSeries : !r.isSeries);
      const pool = targetTypeMatches.length > 0 ? targetTypeMatches : results;
      const normTitle = cleanText(title);
      const normOrig = cleanText(originalTitle);
      const scored = pool.map((item) => {
        const normItem = cleanText(item.title);
        let score = 0;
        if (normTitle && normItem.includes(normTitle)) score += 50;
        if (normOrig && normItem.includes(normOrig)) score += 40;
        if (year) {
          const yStr = String(year);
          if (item.title.includes(yStr) || item.url.includes(yStr)) {
            score += 50;
          }
        }
        if (normTitle && normItem === normTitle) score += 40;
        if (normOrig && normItem === normOrig) score += 40;
        const sequelKeywords = ["bolum iki", "part two", "part 2", " 2", "-2", "bolum uc", "part three", "part 3"];
        const requestedHasSequel = sequelKeywords.some((kw) => normTitle.includes(kw) || normOrig.includes(kw));
        if (!requestedHasSequel) {
          const itemHasSequel = sequelKeywords.some((kw) => normItem.includes(kw) || item.url.includes(kw));
          if (itemHasSequel) {
            score -= 40;
          }
        }
        return { item, score };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored.map((s) => s.item);
    }
    async function resolveEpisodeUrl(seriesUrl, season, episode) {
      try {
        const res = await fetch(seriesUrl, {
          headers: {
            "User-Agent": USER_AGENT,
            "Referer": `${BASE_URL}/`
          }
        });
        if (!res.ok) return null;
        const html = await res.text();
        const $ = cheerio.load(html);
        const sNum = parseInt(season, 10) || 1;
        const eNum = parseInt(episode, 10) || 1;
        const patterns = [
          `${sNum}-sezon-${eNum}-bolum`,
          `sezon-${sNum}/bolum-${eNum}`,
          `${sNum}-sezon/${eNum}-bolum`
        ];
        let foundUrl = null;
        $('a[href*="-sezon-"], a[href*="/bolum/"]').each((i, el) => {
          let href = $(el).attr("href");
          if (!href) return;
          if (href.startsWith("/")) href = `${BASE_URL}${href}`;
          for (const pat of patterns) {
            if (href.toLowerCase().includes(pat)) {
              foundUrl = href;
              return false;
            }
          }
          const text = $(el).text().trim().toLowerCase();
          if (text.includes(`${sNum}. sezon`) && text.includes(`${eNum}. bolum`)) {
            foundUrl = href;
            return false;
          }
        });
        return foundUrl;
      } catch (e) {
        return null;
      }
    }
    async function getStreamsFromPage(pageUrl) {
      const streams = [];
      try {
        const res = await fetch(pageUrl, {
          headers: {
            "User-Agent": USER_AGENT,
            "Referer": `${BASE_URL}/`
          }
        });
        if (!res.ok) return streams;
        const html = await res.text();
        if (html.includes("Telif Hakk\u0131ndan Dolay\u0131 Kald\u0131r\u0131ld\u0131")) {
          return streams;
        }
        const nonceMatch = html.match(/videoAjax\s*=\s*\{[\s\S]*?nonce\s*:\s*['"]([a-zA-Z0-9]+)['"]/i) || html.match(/["']nonce["']\s*:\s*["']([a-zA-Z0-9]+)["']/i);
        const nonce = nonceMatch ? nonceMatch[1] : null;
        const globalPostId = (html.match(/data-post-id=['"](\d+)['"]/) || [])[1] || (html.match(/postid-(\d+)/) || [])[1];
        if (!nonce) return streams;
        const $ = cheerio.load(html);
        const playerOptions = [];
        $("[data-player-name]").each((i, el) => {
          const pid = $(el).attr("data-post-id") || globalPostId;
          const pname = $(el).attr("data-player-name");
          const pkey = $(el).attr("data-part-key") || "";
          if (pid && pname) {
            playerOptions.push({ postId: pid, playerName: pname, partKey: pkey });
          }
        });
        if (playerOptions.length === 0 && globalPostId) {
          playerOptions.push({ postId: globalPostId, playerName: "SetPlay", partKey: "" });
        }
        const uniquePlayers = [];
        const seen = /* @__PURE__ */ new Set();
        for (const p of playerOptions) {
          const key = `${p.postId}_${p.playerName}_${p.partKey}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniquePlayers.push(p);
          }
        }
        await Promise.allSettled(uniquePlayers.map(async (opt) => {
          try {
            const params = new URLSearchParams();
            params.append("action", "get_video_url");
            params.append("nonce", nonce);
            params.append("post_id", opt.postId);
            params.append("player_name", opt.playerName);
            params.append("part_key", opt.partKey || "");
            const ajaxRes = await fetch(`${BASE_URL}/wp-admin/admin-ajax.php`, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": pageUrl,
                "User-Agent": USER_AGENT
              },
              body: params.toString()
            });
            if (!ajaxRes.ok) return;
            const ajaxData = await ajaxRes.json();
            const embedUrl = ajaxData?.data?.url || ajaxData?.data?.stream?.url;
            if (!embedUrl || !embedUrl.startsWith("http")) return;
            if (embedUrl.includes("setplay")) {
              const fastPlayUrl = await extractSetPlay(embedUrl, pageUrl);
              if (fastPlayUrl) {
                const streamData = await extractFastPlay(fastPlayUrl, embedUrl);
                if (streamData && streamData.url) {
                  let label = `SetPlay - 1080p`;
                  if (opt.partKey) {
                    label += ` [${opt.partKey}]`;
                  } else {
                    label += ` (T\xFCrk\xE7e Dublaj & Altyaz\u0131)`;
                  }
                  streams.push({
                    name: "N.O.A.T [HDFilmCehennemi]",
                    title: label,
                    url: streamData.url,
                    quality: "1080p",
                    type: "hls",
                    format: "hls",
                    headers: streamData.headers,
                    subtitles: streamData.subtitles
                  });
                }
              }
            }
          } catch (err) {
          }
        }));
        return streams;
      } catch (e) {
        return streams;
      }
    }
    async function getStreams2(tmdbMeta, season, episode) {
      if (!tmdbMeta) return [];
      const isTv = tmdbMeta.type === "tv" || tmdbMeta.type === "series";
      let results = [];
      if (tmdbMeta.title) {
        results = await searchHDF(tmdbMeta.title);
      }
      if (results.length === 0 && tmdbMeta.originalTitle && tmdbMeta.originalTitle !== tmdbMeta.title) {
        results = await searchHDF(tmdbMeta.originalTitle);
      }
      if (results.length === 0) return [];
      const candidates = rankCandidates(results, tmdbMeta.title, tmdbMeta.originalTitle, isTv, tmdbMeta.year);
      if (candidates.length === 0) return [];
      for (const candidate of candidates) {
        let targetPageUrl = candidate.url;
        if (isTv) {
          const epUrl = await resolveEpisodeUrl(candidate.url, season || 1, episode || 1);
          if (!epUrl) continue;
          targetPageUrl = epUrl;
        }
        const streams = await getStreamsFromPage(targetPageUrl);
        if (streams && streams.length > 0) {
          return streams;
        }
      }
      return [];
    }
    module2.exports = {
      getStreams: getStreams2,
      searchHDF,
      getStreamsFromPage
    };
  }
});

// src/noat/index.js
var { sortStreamsByQuality } = require_quality();
var { loadConfig, val, wrapAll } = require_config();
var { getMediaDetails, getApiKey, TMDB_BASE_URL } = require_tmdb();
var hdfilmcehennemi = require_hdfilmcehennemi();
var _cfgReady = null;
function cfgReady() {
  if (!_cfgReady) {
    _cfgReady = loadConfig().catch(() => ({}));
  }
  return _cfgReady;
}
async function getStreams(id, mediaType, season, episode) {
  try {
    const streams = [];
    const rawId = String(id || "").trim();
    const sNum = season ? parseInt(season, 10) : void 0;
    const eNum = episode ? parseInt(episode, 10) : void 0;
    const tmdbMeta = await getMediaDetails(rawId, mediaType);
    if (!tmdbMeta || !tmdbMeta.title && !tmdbMeta.originalTitle) {
      return [];
    }
    const providerPromises = [
      hdfilmcehennemi.getStreams(tmdbMeta, sNum, eNum)
    ];
    const results = await Promise.allSettled(providerPromises);
    for (const res of results) {
      if (res.status === "fulfilled" && Array.isArray(res.value)) {
        streams.push(...res.value);
      }
    }
    return sortStreamsByQuality(streams);
  } catch (err) {
    console.error("getStreams error:", err);
    return [];
  }
}
async function getCatalog(type, id, extra) {
  try {
    const apiKey = getApiKey();
    var tmdbType = type === "series" || type === "tv" ? "tv" : "movie";
    var endpoint = `${TMDB_BASE_URL}/trending/${tmdbType}/week?api_key=${apiKey}&language=tr-TR`;
    if (extra && extra.search) {
      endpoint = `${TMDB_BASE_URL}/search/${tmdbType}?api_key=${apiKey}&language=tr-TR&query=${encodeURIComponent(extra.search)}`;
    }
    var res = await fetch(endpoint);
    if (!res.ok) return { metas: [] };
    var data = await res.json();
    var results = data.results || [];
    var metas = results.map(function(item) {
      var isMovie = tmdbType === "movie";
      return {
        id: item.id ? String(item.id) : "",
        type: isMovie ? "movie" : "series",
        name: item.title || item.name || "N.O.A.T",
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : void 0,
        background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : void 0,
        description: item.overview || "",
        genres: ["N.O.A.T", isMovie ? "Film" : "Dizi"]
      };
    });
    return { metas };
  } catch (e) {
    return { metas: [] };
  }
}
async function getMeta(args) {
  try {
    const apiKey = getApiKey();
    var rawId = typeof args === "string" ? args : args && args.id ? args.id : "";
    if (!rawId) return { meta: null };
    var type = args && args.type ? args.type : "movie";
    var tmdbType = type === "series" || type === "tv" ? "tv" : "movie";
    var detUrl = `${TMDB_BASE_URL}/${tmdbType}/${rawId}?api_key=${apiKey}&language=tr-TR`;
    var res = await fetch(detUrl);
    if (!res.ok) return { meta: null };
    var d = await res.json();
    var isMovie = tmdbType === "movie";
    var videos = [];
    if (!isMovie && d.seasons) {
      for (var s = 0; s < d.seasons.length; s++) {
        var season = d.seasons[s];
        var sNum = season.season_number;
        if (sNum === 0) continue;
        var epCount = season.episode_count || 0;
        for (var e = 1; e <= epCount; e++) {
          videos.push({
            id: `${rawId}:${sNum}:${e}`,
            title: `${sNum}. Sezon ${e}. B\xF6l\xFCm`,
            season: sNum,
            episode: e
          });
        }
      }
    }
    return {
      meta: {
        id: rawId,
        type: isMovie ? "movie" : "series",
        name: d.title || d.name,
        poster: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : void 0,
        background: d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : void 0,
        description: d.overview,
        genres: (d.genres || []).map(function(g) {
          return g.name;
        }),
        videos: videos.length > 0 ? videos : void 0
      }
    };
  } catch (e2) {
    return { meta: null };
  }
}
async function getSubtitles(id, mediaType, season, episode) {
  return [];
}
module.exports = wrapAll({
  getStreams,
  getSubtitles,
  getCatalog,
  getMeta
}, cfgReady);
if (typeof globalThis !== "undefined") {
  globalThis.getStreams = getStreams;
  globalThis.getSubtitles = getSubtitles;
  globalThis.getCatalog = getCatalog;
  globalThis.getMeta = getMeta;
}

if (typeof globalThis !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    if (module.exports.getStreams) globalThis.getStreams = module.exports.getStreams;
    if (module.exports.getCatalog) globalThis.getCatalog = module.exports.getCatalog;
    if (module.exports.getMeta) globalThis.getMeta = module.exports.getMeta;
    if (module.exports.getSubtitles) globalThis.getSubtitles = module.exports.getSubtitles;
}

