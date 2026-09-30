/**
 * Nuvio Provider: boat
 * Built from src/boat/index.js
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
    var TMDB_BASE_URL = "https://api.themoviedb.org/3";
    var GITHUB_RAW_BASE = "https://raw.githubusercontent.com/dr-octagon/Nuvio/main";
    var CINEMETA_BASE = "https://v3-cinemeta.strem.io";
    var WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";
    var STATIC_KNOWN_TITLES = {
      // 1. The Matrix (TMDB 603 / tt0133093) - Used by Nuvio testScraper
      "603": { tmdbId: "603", imdbId: "tt0133093", title: "Matrix", originalTitle: "The Matrix", year: 1999, type: "movie" },
      "tt0133093": { tmdbId: "603", imdbId: "tt0133093", title: "Matrix", originalTitle: "The Matrix", year: 1999, type: "movie" },
      // 2. Dune Part One (TMDB 438631 / tt1160419)
      "438631": { tmdbId: "438631", imdbId: "tt1160419", title: "Dune: \xC7\xF6l Gezegeni", originalTitle: "Dune", year: 2021, type: "movie" },
      "tt1160419": { tmdbId: "438631", imdbId: "tt1160419", title: "Dune: \xC7\xF6l Gezegeni", originalTitle: "Dune", year: 2021, type: "movie" },
      // 3. Dune Part Two (TMDB 693134 / tt15239678)
      "693134": { tmdbId: "693134", imdbId: "tt15239678", title: "Dune: \xC7\xF6l Gezegeni B\xF6l\xFCm \u0130ki", originalTitle: "Dune: Part Two", year: 2024, type: "movie" },
      "tt15239678": { tmdbId: "693134", imdbId: "tt15239678", title: "Dune: \xC7\xF6l Gezegeni B\xF6l\xFCm \u0130ki", originalTitle: "Dune: Part Two", year: 2024, type: "movie" },
      // 4. The Dark Knight (TMDB 155 / tt0468569)
      "155": { tmdbId: "155", imdbId: "tt0468569", title: "Kara \u015E\xF6valye", originalTitle: "The Dark Knight", year: 2008, type: "movie" },
      "tt0468569": { tmdbId: "155", imdbId: "tt0468569", title: "Kara \u015E\xF6valye", originalTitle: "The Dark Knight", year: 2008, type: "movie" },
      // 5. The Shawshank Redemption (TMDB 278 / tt0111161)
      "278": { tmdbId: "278", imdbId: "tt0111161", title: "Esaretin Bedeli", originalTitle: "The Shawshank Redemption", year: 1994, type: "movie" },
      "tt0111161": { tmdbId: "278", imdbId: "tt0111161", title: "Esaretin Bedeli", originalTitle: "The Shawshank Redemption", year: 1994, type: "movie" },
      // 6. Breaking Bad (TMDB 1396 / tt0903747)
      "1396": { tmdbId: "1396", imdbId: "tt0903747", title: "Breaking Bad", originalTitle: "Breaking Bad", year: 2008, type: "tv" },
      "tt0903747": { tmdbId: "1396", imdbId: "tt0903747", title: "Breaking Bad", originalTitle: "Breaking Bad", year: 2008, type: "tv" },
      // 7. Deadpool & Wolverine (TMDB 533535 / tt6263850)
      "533535": { tmdbId: "533535", imdbId: "tt6263850", title: "Deadpool & Wolverine", originalTitle: "Deadpool & Wolverine", year: 2024, type: "movie" },
      "tt6263850": { tmdbId: "533535", imdbId: "tt6263850", title: "Deadpool & Wolverine", originalTitle: "Deadpool & Wolverine", year: 2024, type: "movie" },
      // 8. The Substance (TMDB 933260 / tt17526714)
      "933260": { tmdbId: "933260", imdbId: "tt17526714", title: "Cevher", originalTitle: "The Substance", year: 2024, type: "movie" },
      "tt17526714": { tmdbId: "933260", imdbId: "tt17526714", title: "Cevher", originalTitle: "The Substance", year: 2024, type: "movie" },
      // 9. Interstellar (TMDB 157336 / tt0816692)
      "157336": { tmdbId: "157336", imdbId: "tt0816692", title: "Y\u0131ld\u0131zlararas\u0131", originalTitle: "Interstellar", year: 2014, type: "movie" },
      "tt0816692": { tmdbId: "157336", imdbId: "tt0816692", title: "Y\u0131ld\u0131zlararas\u0131", originalTitle: "Interstellar", year: 2014, type: "movie" },
      // 10. Fight Club (TMDB 550 / tt0137523)
      "550": { tmdbId: "550", imdbId: "tt0137523", title: "D\xF6v\xFC\u015F Kul\xFCb\xFC", originalTitle: "Fight Club", year: 1999, type: "movie" },
      "tt0137523": { tmdbId: "550", imdbId: "tt0137523", title: "D\xF6v\xFC\u015F Kul\xFCb\xFC", originalTitle: "Fight Club", year: 1999, type: "movie" },
      // 11. Inception (TMDB 27205 / tt1375666)
      "27205": { tmdbId: "27205", imdbId: "tt1375666", title: "Ba\u015Flang\u0131\xE7", originalTitle: "Inception", year: 2010, type: "movie" },
      "tt1375666": { tmdbId: "27205", imdbId: "tt1375666", title: "Ba\u015Flang\u0131\xE7", originalTitle: "Inception", year: 2010, type: "movie" },
      // 12. Game of Thrones (TMDB 1399 / tt0944947)
      "1399": { tmdbId: "1399", imdbId: "tt0944947", title: "Game of Thrones", originalTitle: "Game of Thrones", year: 2011, type: "tv" },
      "tt0944947": { tmdbId: "1399", imdbId: "tt0944947", title: "Game of Thrones", originalTitle: "Game of Thrones", year: 2011, type: "tv" }
    };
    function getApiKey() {
      if (typeof globalThis !== "undefined" && globalThis.TMDB_API_KEY) {
        return globalThis.TMDB_API_KEY;
      }
      return TMDB_DEFAULT_KEY;
    }
    async function fetchWithTimeout2(url, options, timeoutMs) {
      options = options || {};
      timeoutMs = timeoutMs || 8e3;
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
        imdbId: isImdb ? cleanId : "",
        title: "",
        originalTitle: "",
        year: null,
        type: tmdbType,
        details: null
      };
      if (!cleanId) return result;
      if (STATIC_KNOWN_TITLES[cleanId]) {
        var staticItem = STATIC_KNOWN_TITLES[cleanId];
        return {
          tmdbId: staticItem.tmdbId,
          imdbId: staticItem.imdbId,
          title: staticItem.title,
          originalTitle: staticItem.originalTitle,
          year: staticItem.year,
          type: staticItem.type || tmdbType,
          details: null
        };
      }
      try {
        var ghUrl = `${GITHUB_RAW_BASE}/meta/${type}/${cleanId}.json`;
        var ghRes = await fetchWithTimeout2(ghUrl, { headers: { "Accept": "application/json" } }, 4e3);
        if (ghRes && ghRes.ok) {
          var ghData = await ghRes.json();
          var meta = ghData && ghData.meta;
          if (meta && meta.name) {
            result.title = String(meta.name).replace(/\s*\(\d{4}\)$/, "").trim();
            result.originalTitle = meta.originalName || meta.originalTitle || result.title;
            var y = meta.releaseInfo ? parseInt(meta.releaseInfo, 10) : meta.year ? parseInt(meta.year, 10) : null;
            result.year = y && !isNaN(y) ? y : null;
            if (meta.tmdbId) result.tmdbId = String(meta.tmdbId);
            if (meta.imdbId) result.imdbId = String(meta.imdbId);
            result.details = meta;
            return result;
          }
        }
      } catch (e) {
      }
      try {
        var sparqlQuery = "";
        if (isImdb) {
          sparqlQuery = `SELECT ?itemLabel ?tmdbMovie ?tmdbTv WHERE { ?item wdt:P345 "${cleanId}" . OPTIONAL { ?item wdt:P4947 ?tmdbMovie } OPTIONAL { ?item wdt:P4983 ?tmdbTv } SERVICE wikibase:label { bd:serviceParam wikibase:language "tr,en". } } LIMIT 1`;
        } else {
          var tmdbProp = isTv ? "wdt:P4983" : "wdt:P4947";
          sparqlQuery = `SELECT ?itemLabel ?imdb WHERE { ?item ${tmdbProp} "${cleanId}" . OPTIONAL { ?item wdt:P345 ?imdb } SERVICE wikibase:label { bd:serviceParam wikibase:language "tr,en". } } LIMIT 1`;
        }
        var wikiUrl = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(sparqlQuery)}&format=json`;
        var wikiRes = await fetchWithTimeout2(wikiUrl, {
          headers: { "User-Agent": "NuvioScraper/1.0 (https://github.com/dr-octagon/Nuvio)", "Accept": "application/json" }
        }, 8e3);
        if (wikiRes && wikiRes.ok) {
          var wikiData = await wikiRes.json();
          var row = wikiData && wikiData.results && wikiData.results.bindings && wikiData.results.bindings[0];
          if (row) {
            if (row.itemLabel && row.itemLabel.value) {
              result.title = row.itemLabel.value.trim();
            }
            if (isImdb) {
              var foundTmdb = row.tmdbMovie && row.tmdbMovie.value || row.tmdbTv && row.tmdbTv.value;
              if (foundTmdb) result.tmdbId = String(foundTmdb);
            } else if (row.imdb && row.imdb.value) {
              result.imdbId = row.imdb.value.trim();
            }
          }
        }
      } catch (e) {
      }
      var effectiveImdbId = result.imdbId || (isImdb ? cleanId : "");
      if (effectiveImdbId) {
        try {
          var cmUrl = `${CINEMETA_BASE}/meta/${type}/${effectiveImdbId}.json`;
          var cmRes = await fetchWithTimeout2(cmUrl, { headers: { "Accept": "application/json" } }, 6e3);
          if (cmRes && cmRes.ok) {
            var cmData = await cmRes.json();
            var cmMeta = cmData && cmData.meta;
            if (cmMeta && cmMeta.name) {
              result.originalTitle = String(cmMeta.name).trim();
              if (!result.title) result.title = result.originalTitle;
              var cy = cmMeta.year ? parseInt(cmMeta.year, 10) : null;
              if (!result.year && cy && !isNaN(cy)) result.year = cy;
              if (!result.tmdbId && cmMeta.moviedb_id) result.tmdbId = String(cmMeta.moviedb_id);
              result.details = cmMeta;
              return result;
            }
          }
        } catch (e) {
        }
      }
      if (result.title) {
        if (!result.originalTitle) result.originalTitle = result.title;
        return result;
      }
      try {
        var apiKey = getApiKey();
        var tmdbId = isImdb ? null : cleanId;
        if (isImdb) {
          var findUrl = `${TMDB_BASE_URL}/find/${cleanId}?api_key=${apiKey}&external_source=imdb_id`;
          var findRes = await fetchWithTimeout2(findUrl, {}, 5e3);
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
          var detUrl = `${TMDB_BASE_URL}/${tmdbType}/${tmdbId}?api_key=${apiKey}&language=tr-TR`;
          var detRes = await fetchWithTimeout2(detUrl, {}, 5e3);
          if (detRes && detRes.ok) {
            var d = await detRes.json();
            result.tmdbId = String(tmdbId);
            result.title = d.title || d.name || "";
            result.originalTitle = d.original_title || d.original_name || result.title;
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
      getApiKey,
      getMediaDetails: getMediaDetails2,
      TMDB_BASE_URL,
      GITHUB_RAW_BASE,
      CINEMETA_BASE,
      WIKIDATA_SPARQL_URL
    };
  }
});

// src/boat/index.js
var { sortStreamsByQuality } = require_quality();
var { loadConfig, val, wrapAll } = require_config();
var { getMediaDetails } = require_tmdb();
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
async function fetchWithTimeout(url, options = {}, timeoutMs = 8e3) {
  const hasTimeout = typeof setTimeout === "function";
  const controller = hasTimeout && typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = hasTimeout && controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const fetchOpts = Object.assign({}, options, {
      headers: Object.assign({}, DEFAULT_HEADERS, options.headers || {})
    });
    if (controller) fetchOpts.signal = controller.signal;
    const res = await fetch(url, fetchOpts);
    if (timeoutId && typeof clearTimeout === "function") clearTimeout(timeoutId);
    return res;
  } catch (e) {
    if (timeoutId && typeof clearTimeout === "function") clearTimeout(timeoutId);
    return null;
  }
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
async function resolveMediaMeta(id, mediaType, season, episode) {
  const isSeries = mediaType === "tv" || mediaType === "series";
  let cleanId = String(id || "").trim();
  cleanId = cleanId.replace(/^boat:movie:/, "").replace(/^boat:series:/, "").replace(/^boat:ep:/, "").replace(/^boat:/, "").replace(/^noat:movie:/, "").replace(/^noat:series:/, "").replace(/^noat:ep:/, "").replace(/^noat:/, "");
  if (cleanId.includes(":")) {
    const parts = cleanId.split(":");
    cleanId = parts[0];
    if (parts[1] && !season) season = parseInt(parts[1], 10);
    if (parts[2] && !episode) episode = parseInt(parts[2], 10);
  }
  const meta = await getMediaDetails(cleanId, mediaType);
  let imdbId = meta.imdbId || (cleanId.startsWith("tt") ? cleanId : null);
  let tmdbId = meta.tmdbId || (!cleanId.startsWith("tt") ? cleanId : null);
  let title = meta.title || meta.originalTitle;
  let year = meta.year ? String(meta.year) : null;
  let episodeImdbId = null;
  if (isSeries && tmdbId && season && episode) {
    const apiKey = getEffectiveTmdbApiKey();
    try {
      const epRes = await fetchWithTimeout(
        `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}/episode/${episode}/external_ids?api_key=${apiKey}`,
        {},
        1500
      );
      if (epRes && epRes.ok) {
        const epData = await epRes.json();
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
}
async function fetchOpenSubtitles(meta) {
  if (!meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
  try {
    const streamTarget = meta.isSeries ? `series/${meta.imdbId}:${meta.season}:${meta.episode}.json` : `movie/${meta.imdbId}.json`;
    const url = `${OPENSUBTITLES_API}/subtitles/${streamTarget}`;
    const res = await fetchWithTimeout(url, {}, 7e3);
    if (!res || !res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.subtitles)) return [];
    const trSubs = [];
    const enSubs = [];
    const otherSubs = [];
    const seen = /* @__PURE__ */ new Set();
    data.subtitles.forEach((s) => {
      if (!s.url || seen.has(s.url)) return;
      seen.add(s.url);
      const subUrl = s.url.endsWith(".srt") || s.url.endsWith(".vtt") ? s.url : s.url + ".srt";
      const langLower = (s.lang || "").toLowerCase();
      const isTr = langLower === "tur" || langLower === "tr";
      const isEn = langLower === "eng" || langLower === "en";
      let label = s.name || s.subtitleFileName || (isTr ? "T\xFCrk\xE7e" : isEn ? "\u0130ngilizce" : langLower.toUpperCase());
      if (isTr) label = `\u{1F1F9}\u{1F1F7} ${label}`;
      else if (isEn) label = `\u{1F1EC}\u{1F1E7} ${label}`;
      const subObj = {
        id: `os_${langLower}_${seen.size}`,
        url: subUrl,
        language: isTr ? "tr" : isEn ? "en" : langLower,
        name: label
      };
      if (isTr) {
        trSubs.push(subObj);
      } else if (isEn) {
        if (enSubs.length < 5) enSubs.push(subObj);
      } else {
        if (otherSubs.length < 5) otherSubs.push(subObj);
      }
    });
    return [...trSubs, ...enSubs, ...otherSubs];
  } catch (e) {
    return [];
  }
}
async function fetchTorrentioStreams(meta) {
  if (!meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
  try {
    const streamTarget = meta.isSeries ? `series/${meta.imdbId}:${meta.season}:${meta.episode}.json` : `movie/${meta.imdbId}.json`;
    const url = `${TORRENTIO_API}/stream/${streamTarget}`;
    const res = await fetchWithTimeout(url, {}, 9e3);
    if (!res || !res.ok) return [];
    const data = await res.json();
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
}
async function fetchTorrentsDbStreams(meta) {
  if (!meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
  try {
    const streamTarget = meta.isSeries ? `series/${meta.imdbId}:${meta.season}:${meta.episode}.json` : `movie/${meta.imdbId}.json`;
    const url = `${TORRENTSDB_API}/stream/${streamTarget}`;
    const res = await fetchWithTimeout(url, {}, 9e3);
    if (!res || !res.ok) return [];
    const data = await res.json();
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
}
async function fetchTpbStreams(meta) {
  if (!meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
  try {
    const streamTarget = meta.isSeries ? `series/${meta.imdbId}:${meta.season}:${meta.episode}.json` : `movie/${meta.imdbId}.json`;
    const url = `${TPB_API}/stream/${streamTarget}`;
    const res = await fetchWithTimeout(url, {}, 8e3);
    if (!res || !res.ok) return [];
    const data = await res.json();
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
}
async function fetchYtsStreams(meta) {
  if (meta.isSeries || !meta.imdbId || !meta.imdbId.startsWith("tt")) return [];
  for (const mirror of YTS_MIRRORS) {
    try {
      const url = `${mirror}/api/v2/movie_details.json?imdb_id=${meta.imdbId}&with_images=false`;
      const res = await fetchWithTimeout(url, {}, 7e3);
      if (!res || !res.ok) continue;
      const data = await res.json();
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
}
async function getStreams(id, mediaType, season, episode) {
  try {
    const meta = await resolveMediaMeta(id, mediaType, season, episode);
    const [
      subtitlesSettled,
      torrentioSettled,
      torrentsDbSettled,
      tpbSettled,
      ytsSettled
    ] = await Promise.allSettled([
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
}
async function getSubtitles(id, mediaType, season, episode) {
  try {
    const meta = await resolveMediaMeta(id, mediaType, season, episode);
    return await fetchOpenSubtitles(meta);
  } catch (e) {
    return [];
  }
}
async function getCatalog(type, id, extra = {}) {
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
    const res = await fetchWithTimeout(url, {}, 8e3);
    if (!res || !res.ok) return { metas: [] };
    const data = await res.json();
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
}
async function getMeta(args) {
  try {
    const apiKey = getEffectiveTmdbApiKey();
    const rawId = typeof args === "string" ? args : args && args.id ? args.id : "";
    if (!rawId) return { meta: null };
    let cleanId = rawId.replace(/^boat:movie:/, "").replace(/^boat:series:/, "").replace(/^boat:/, "");
    const isSeries = rawId.includes(":series:") || args && args.type === "series";
    const endpoint = isSeries ? `tv/${cleanId}` : `movie/${cleanId}`;
    const res = await fetchWithTimeout(
      `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&append_to_response=external_ids&language=tr-TR`,
      {},
      8e3
    );
    if (!res || !res.ok) return { meta: null };
    const d = await res.json();
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
}
if (typeof module !== "undefined") {
  module.exports = wrapAll({
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

if (typeof globalThis !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    if (module.exports.getStreams) globalThis.getStreams = module.exports.getStreams;
    if (module.exports.getCatalog) globalThis.getCatalog = module.exports.getCatalog;
    if (module.exports.getMeta) globalThis.getMeta = module.exports.getMeta;
    if (module.exports.getSubtitles) globalThis.getSubtitles = module.exports.getSubtitles;
}

