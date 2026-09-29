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
    function sortStreamsByQuality2(streams) {
      if (!Array.isArray(streams) || streams.length === 0) return streams;
      return streams.slice().sort(function(a, b) {
        return getQualityScore(b) - getQualityScore(a);
      });
    }
    module2.exports = {
      getQualityScore,
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

// src/noat/index.js
var { sortStreamsByQuality } = require_quality();
var { loadConfig, val, wrapAll } = require_config();
var _cfgReady = null;
function cfgReady() {
  if (!_cfgReady) {
    _cfgReady = loadConfig().catch(() => ({}));
  }
  return _cfgReady;
}
var TMDB_API_KEY = "500330721680edb6d5f7f12ba7cd9023";
var TMDB_BASE = "https://api.themoviedb.org/3";
function resolveTmdb(id, mediaType) {
  return __async(this, null, function* () {
    try {
      var cleanId = String(id || "").trim();
      if (cleanId.includes(":")) cleanId = cleanId.split(":")[0];
      var isImdb = cleanId.startsWith("tt");
      var tmdbId = cleanId;
      var details = null;
      var type = mediaType === "tv" || mediaType === "series" ? "tv" : "movie";
      if (isImdb) {
        var findUrl = `${TMDB_BASE}/find/${cleanId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`;
        var findRes = yield fetch(findUrl);
        if (findRes.ok) {
          var fData = yield findRes.json();
          var item = type === "tv" ? fData.tv_results && fData.tv_results[0] : fData.movie_results && fData.movie_results[0];
          if (item) {
            tmdbId = item.id;
            details = item;
          }
        }
      }
      if (tmdbId) {
        var detUrl = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=tr-TR`;
        var dRes = yield fetch(detUrl);
        if (dRes.ok) {
          details = yield dRes.json();
        }
      }
      return { tmdbId, details, type };
    } catch (e) {
      return { tmdbId: null, details: null, type: "movie" };
    }
  });
}
function getStreams(id, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const streams = [];
      const rawId = String(id || "").trim();
      const sNum = parseInt(season) || 1;
      const eNum = parseInt(episode) || 1;
      const { tmdbId, details, type } = yield resolveTmdb(rawId, mediaType);
      return sortStreamsByQuality(streams);
    } catch (err) {
      return [];
    }
  });
}
function getCatalog(type, id, extra) {
  return __async(this, null, function* () {
    try {
      var tmdbType = type === "series" || type === "tv" ? "tv" : "movie";
      var endpoint = `${TMDB_BASE}/trending/${tmdbType}/week?api_key=${TMDB_API_KEY}&language=tr-TR`;
      if (extra && extra.search) {
        endpoint = `${TMDB_BASE}/search/${tmdbType}?api_key=${TMDB_API_KEY}&language=tr-TR&query=${encodeURIComponent(extra.search)}`;
      }
      var res = yield fetch(endpoint);
      if (!res.ok) return { metas: [] };
      var data = yield res.json();
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
  });
}
function getMeta(args) {
  return __async(this, null, function* () {
    try {
      var rawId = typeof args === "string" ? args : args && args.id ? args.id : "";
      if (!rawId) return { meta: null };
      var type = args && args.type ? args.type : "movie";
      var tmdbType = type === "series" || type === "tv" ? "tv" : "movie";
      var detUrl = `${TMDB_BASE}/${tmdbType}/${rawId}?api_key=${TMDB_API_KEY}&language=tr-TR`;
      var res = yield fetch(detUrl);
      if (!res.ok) return { meta: null };
      var d = yield res.json();
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
  });
}
function getSubtitles(id, mediaType, season, episode) {
  return __async(this, null, function* () {
    return [];
  });
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

