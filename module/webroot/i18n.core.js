/*!
 * Any - CA :: webroot/i18n.core.js
 * Runtime language resolution and lookup.
 *
 * Load order in index.html:
 *   i18n.js        (registry + English baseline + empty T)
 *   i18n.zh.js     (Chinese variants)
 *   i18n.ja/ko/…   (other translations)
 *   i18n.core.js   (this file: resolve + t())
 *
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 */
(function (root) {
  'use strict';
  var D = root.__ANYCA_I18N__;
  if (!D) { root.I18N = null; return; }

  var LANGS = D.LANGS, ALIASES = D.ALIASES, EN = D.EN, T = D.T;

  function normalizeTag(tag) {
    if (!tag) return 'en';
    tag = String(tag).trim();
    /* exact alias first (handles zh-Hans etc.) */
    if (ALIASES[tag]) return ALIASES[tag];
    var low = tag.toLowerCase();
    if (ALIASES[low]) return ALIASES[low];
    /* language only */
    var base = low.split(/[-_]/)[0];
    if (ALIASES[base]) return ALIASES[base];
    /* full tag with region: zh_CN style */
    var withRegion = low.replace('-', '_');
    if (T[withRegion]) return withRegion;
    if (T[base]) return base;
    /* not translated: still a valid UI language, fall back to English */
    return base;
  }

  /** Detect the best language for this device. */
  function detect() {
    var cands = [];
    try {
      if (navigator.languages && navigator.languages.length) {
        cands = Array.prototype.slice.call(navigator.languages);
      }
    } catch (e) {}
    if (!cands.length && navigator.language) cands = [navigator.language];
    for (var i = 0; i < cands.length; i++) {
      var tag = normalizeTag(cands[i]);
      if (T[tag] || tag === 'en') return tag;
    }
    return cands.length ? normalizeTag(cands[0]) : 'en';
  }

  /** Look up a key for a language, falling back to English. */
  function t(lang, key) {
    var table = T[lang];
    if (table && Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    if (Object.prototype.hasOwnProperty.call(EN, key)) return EN[key];
    return key;
  }

  /** Display name for a language code. */
  function name(code) {
    for (var i = 0; i < LANGS.length; i++) {
      if (LANGS[i][0] === code) return LANGS[i][1];
    }
    return code;
  }

  root.I18N = {
    LANGS: LANGS,
    ALIASES: ALIASES,
    detect: detect,
    normalize: normalizeTag,
    t: t,
    name: name,
    has: function (code) { return !!T[code]; }
  };
})(typeof self !== 'undefined' ? self : this);
