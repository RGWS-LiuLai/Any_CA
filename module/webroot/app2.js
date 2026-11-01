/*!
 * Any - CA :: webroot/app2.js
 * Import / generate / export / language / about / boot.
 *
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 */
(function () {
  'use strict';

  var A = window.AnyCA;
  var S = A.S, t = A.t, exec = A.exec, shq = A.shq;
  var MOD_DIR = '/data/adb/modules/Any_CA';
  var SCRIPTS = MOD_DIR + '/scripts';

  /* ================= file reading ================= */

  function readFileViaPath(path) {
    return exec('cat ' + shq(path) + ' 2>/dev/null').then(function (r) {
      if (r.errno !== 0 || !r.stdout) throw new Error('READ_FAIL');
      return r.stdout;
    });
  }

  function pickFile(accept) {
    return new Promise(function (resolve) {
      var input = document.createElement('input');
      input.type = 'file';
      if (accept) input.accept = accept;
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', function () {
        var f = input.files && input.files[0];
        document.body.removeChild(input);
        if (!f) { resolve(null); return; }
        var fr = new FileReader();
        fr.onload = function () { resolve({ name: f.name, text: String(fr.result) }); };
        fr.onerror = function () { resolve(null); };
        fr.readAsText(f);
      });
      input.click();
    });
  }

  /* ================= CA import ================= */

  /**
   * Import / trust CA certificate(s).
   *
   * Accepts a file containing ONE or MANY PEM certificates (e.g. a
   * concatenated CA bundle). Every certificate becomes its own list item
   * and is staged into the system trust store; afterwards the OEM
   * attestation overlay is rebuilt from all enabled CA items.
   *
   * @param {string} text  file content (may hold multiple PEM blocks)
   * @param {string} title display title (file name)
   */
  function importCA(text, title) {
    A.setBusy(true, 'busy_parsing');

    /* collect EVERY PEM block, not just the first one */
    var raw = CertUtils.extractPEMs(text);
    if (!raw.length) {
      A.setBusy(false);
      A.toast(t('err_nocert'));
      return Promise.resolve();
    }

    /* prepare one record per certificate; skip unparsable ones */
    var baseTitle = String(title || 'CA').replace(/\.[^.]+$/, '');
    var certs = [];
    var seen = {};
    raw.forEach(function (p, i) {
      var pem, der, hash;
      try {
        pem = CertUtils.normalizePEM(p);
        der = CertUtils.pemToDer(pem);
        hash = CertUtils.subjectHashHex(der);
      } catch (e) {
        return; /* skip broken block */
      }
      if (!hash) return;
      if (seen[hash]) return; /* dedupe identical certs in one file */
      seen[hash] = 1;
      certs.push({
        pem: pem,
        hash: hash,
        title: raw.length > 1 ? (baseTitle + ' #' + (i + 1)) : baseTitle
      });
    });

    if (!certs.length) {
      A.setBusy(false);
      A.toast(t('err_nocert'));
      return Promise.resolve();
    }

    /* stage them one by one (each gets its own item directory) */
    var chain = Promise.resolve(0);
    var now = Date.now();

    certs.forEach(function (c, idx) {
      chain = chain.then(function (count) {
        var itemId = 'ca-' + (now + idx);
        var b64 = CertUtils.bytesToB64(new TextEncoder().encode(c.pem));
        var safeTitle = c.title.replace(/["$`\\]/g, '');
        var cmd =
          'mkdir -p ' + shq(MOD_DIR + '/data/items/' + itemId) + ' && ' +
          'echo ' + shq(b64) + ' | base64 -d > ' +
            shq(MOD_DIR + '/data/items/' + itemId + '/payload.pem') + ' && ' +
          'n=$(sh ' + SCRIPTS + '/trust.sh install ' +
            shq(MOD_DIR + '/data/items/' + itemId + '/payload.pem') + ' ' +
            shq(c.hash) + ') || n="" ; ' +
          'echo "type=ca" > ' + shq(MOD_DIR + '/data/items/' + itemId + '/meta.conf') + ' && ' +
          'echo "title=' + safeTitle + '" >> ' + shq(MOD_DIR + '/data/items/' + itemId + '/meta.conf') + ' && ' +
          'echo "enabled=1" >> ' + shq(MOD_DIR + '/data/items/' + itemId + '/meta.conf') + ' && ' +
          'echo "pinned=0" >> ' + shq(MOD_DIR + '/data/items/' + itemId + '/meta.conf') + ' && ' +
          'echo "created=$(date +%Y%m%d%H%M%S)" >> ' + shq(MOD_DIR + '/data/items/' + itemId + '/meta.conf') + ' && ' +
          'echo "hash=' + c.hash + '" >> ' + shq(MOD_DIR + '/data/items/' + itemId + '/meta.conf') + ' && ' +
          'echo "installed=$n"';
        return exec(cmd).then(function (r) {
          return count + (r.errno === 0 ? 1 : 0);
        });
      });
    });

    return chain.then(function (okCount) {
      if (!okCount) {
        A.setBusy(false);
        A.toast(t('err_generic'));
        return;
      }
      A.setBusy(false);
      A.toast(t('ca_import_done') + (okCount > 1 ? ' ×' + okCount : '') +
              ' · ' + t('reboot_required'));
      return A.refresh();
    });
  }

  /**
   * Rebuild the overlay from every enabled CA item stored under
   * data/items/<id>/payload.pem, so the OEM trust array always mirrors
   * the list the user sees.
   */

  /* ================= language ================= */

  function openLanguage() {
    var list = I18N.LANGS.map(function (l) {
      var active = l[0] === S.lang;
      return '<div class="lang-item' + (active ? ' active' : '') + '" data-lang="' + A.esc(l[0]) + '">' +
        '<span>' + A.esc(l[1]) + '</span><small>' + A.esc(l[0]) + '</small></div>';
    }).join('');

    A.openModal(
      '<div class="sheet-head"><h3>' + A.esc(t('language')) + '</h3>' +
      '<button class="iconbtn" data-x="c">✕</button></div>' +
      '<div class="lang-item' + (!S.langManual ? ' active' : '') + '" data-lang="__auto">' +
        '<span>' + A.esc(t('lang_auto')) + '</span><small>auto</small></div>' +
      '<div class="lang-list">' + list + '</div>',
      function (sheet) {
        sheet.querySelector('[data-x="c"]').onclick = A.closeModal;
        sheet.querySelectorAll('[data-lang]').forEach(function (el) {
          el.onclick = function () {
            var code = el.getAttribute('data-lang');
            if (code === '__auto') {
              localStorage.removeItem('anyca_lang');
              S.langManual = false;
              S.lang = I18N.detect();
            } else {
              localStorage.setItem('anyca_lang', code);
              S.langManual = true;
              S.lang = code;
            }
            A.closeModal();
            A.applyI18n();
          };
        });
      }
    );
  }

  /* ================= about ================= */

  function openAbout() {
    A.openModal(
      '<div class="sheet-head"><h3>' + A.esc(t('about')) + '</h3>' +
      '<button class="iconbtn" data-x="c">✕</button></div>' +
      '<div class="about-hero">' +
        '<div class="about-logo">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>' +
        '</div>' +
        '<div class="about-name">Any - CA</div>' +
        '<div class="about-ver">v2.0.0 (2)</div>' +
      '</div>' +
      '<div class="link-row" data-url="https://github.com/RGWS-LiuLai/Any_CA">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.3.9.1-.7.4-1.3.7-1.5-2.6-.3-5.2-1.3-5.2-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.3.8 1 1 2.1v3.1c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.6 18.4.5 12 .5z"/></svg>' +
        '<span><span class="lr-title">GitHub</span><br><span class="lr-sub">RGWS-LiuLai/Any_CA</span></span>' +
      '</div>' +
      '<div class="link-row" data-url="https://www.coolapk.com/u/28676823">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>' +
        '<span><span class="lr-title">' + A.esc(t('coolapk')) + '</span><br><span class="lr-sub">恋勿思 (RGWS-LiuLai)</span></span>' +
      '</div>' +
      '<div class="license-note">' + A.esc(t('license_note')) +
        '<br><br>GPL-3.0 · © 2026 RGWS-LiuLai</div>',
      function (sheet) {
        sheet.querySelector('[data-x="c"]').onclick = A.closeModal;
        sheet.querySelectorAll('[data-url]').forEach(function (el) {
          el.onclick = function () {
            var url = el.getAttribute('data-url');
            if (KSU) exec('am start -a android.intent.action.VIEW -d ' + shq(url) + ' >/dev/null 2>&1');
            else window.open(url, '_blank');
          };
        });
      }
    );
  }

  /* ================= boot ================= */

  function boot() {
    /* ------------------------------------------------------------
     * Bind every control FIRST, so a failure in theming/i18n can
     * never leave the UI unresponsive.
     * ---------------------------------------------------------- */

    /* header buttons */
    document.getElementById('btnTheme').onclick = function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('anyca_theme', next); } catch (e) {}
      S.theme = next; S.themeManual = true;
      document.documentElement.setAttribute('data-theme', next);
    };
    document.getElementById('btnLang').onclick = openLanguage;
    document.getElementById('btnAbout').onclick = openAbout;

    /* action buttons */
    document.getElementById('btnImportCa').onclick = function () {
      pickFile('.pem,.crt,.cer,.der,.xml').then(function (f) {
        if (!f) return;
        importCA(f.text, f.name);
      });
    };

    /* ------------------------------------------------------------
     * Then apply theme and language (each guarded independently).
     * ---------------------------------------------------------- */

    /* theme */
    try {
      var savedTheme = localStorage.getItem('anyca_theme');
      S.themeManual = savedTheme === 'light' || savedTheme === 'dark';
      var theme = S.themeManual ? savedTheme
        : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      S.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) { console.error('theme init', e); }

    /* language */
    try {
      var savedLang = localStorage.getItem('anyca_lang');
      S.langManual = !!savedLang;
      if (typeof I18N !== 'undefined' && I18N) {
        S.lang = savedLang ? I18N.normalize(savedLang) : I18N.detect();
      } else {
        S.lang = 'en';
      }
    } catch (e) {
      console.error('lang init', e);
      S.lang = 'en';
    }

    try { A.applyI18n(); } catch (e) { console.error('applyI18n', e); }

    /* data */
    try { A.refresh(); } catch (e) { console.error('refresh', e); }

    /* remember the device SDK for overlay manifest generation */
    exec('getprop ro.build.version.sdk').then(function (r) {
      var v = parseInt((r.stdout || '').trim(), 10);
      if (v > 0) window.__ANYCA_SDK__ = v;
      console.log('device sdk =', window.__ANYCA_SDK__);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
