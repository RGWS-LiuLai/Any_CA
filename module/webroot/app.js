/*!
 * Any - CA :: webroot/app.js
 * Main WebUI controller: status, list, import, generate, export, modals.
 *
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 *   https://github.com/RGWS-LiuLai/Any_CA
 */
(function () {
  'use strict';

  /* ================= constants ================= */

  var MOD_ID = 'Any_CA';
  var MOD_DIR = '/data/adb/modules/' + MOD_ID;
  var SCRIPTS = MOD_DIR + '/scripts';

  /* ================= state ================= */

  var S = {
    lang: 'en',
    langManual: false,
    theme: 'light',
    themeManual: false,
    items: [],
    color: 'red',
    total: 0,
    enabled: 0,
    effective: 0,
    busy: false
  };

  /* ================= ksu bridge ================= */

  var KSU = null;
  try { KSU = (typeof ksu !== 'undefined') ? ksu : (window.ksu || null); } catch (e) { KSU = null; }

  var _seq = 0;
  function exec(cmd) {
    return new Promise(function (resolve) {
      if (!KSU || typeof KSU.exec !== 'function') {
        resolve({ errno: -1, stdout: '', stderr: 'no ksu api' });
        return;
      }
      var cb = '__anyca' + (++_seq);
      window[cb] = function (errno, stdout, stderr) {
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        resolve({
          errno: errno | 0,
          stdout: String(stdout == null ? '' : stdout),
          stderr: String(stderr == null ? '' : stderr)
        });
      };
      try { KSU.exec(cmd, '{}', cb); }
      catch (e1) {
        try { KSU.exec(cmd, cb); }
        catch (e2) { resolve({ errno: -1, stdout: '', stderr: String(e1 && e1.message || e1) }); }
      }
    });
  }

  function shq(s) {
    return "'" + String(s).replace(/'/g, "'\\''") + "'";
  }

  function toast(msg) {
    if (KSU && typeof KSU.toast === 'function') {
      try { KSU.toast(msg); return; } catch (e) {}
    }
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, 2600);
  }

  /* ================= i18n ================= */

  function t(k) { return I18N ? I18N.t(S.lang, k) : k; }

  function applyI18n() {
    if (typeof I18N === 'undefined' || !I18N) return;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    var lc = document.getElementById('langCode');
    if (lc) {
      lc.textContent =
        S.lang === 'zh_CN' || S.lang === 'zh' ? '中' :
        S.lang === 'zh_TW' || S.lang === 'zh_HK' || S.lang === 'zh_MO' ? '繁' :
        String(S.lang).slice(0, 2).toUpperCase();
    }
    try { renderHero(); } catch (e) { console.error('renderHero', e); }
    try { renderList(); } catch (e) { console.error('renderList', e); }
  }

  /* ================= theme ================= */

  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
  }

  function detectTheme() {
    var s = localStorage.getItem('anyca_theme');
    if (s === 'light' || s === 'dark') { S.themeManual = true; return s; }
    return (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  /* ================= modal helper ================= */

  var modalRoot = null;

  /** Resolve the modal container lazily (the DOM may not be ready yet). */
  function getModalRoot() {
    if (!modalRoot) modalRoot = document.getElementById('modalRoot');
    return modalRoot;
  }

  function openModal(html, onMount) {
    var root = getModalRoot();
    if (!root) { console.error('modalRoot missing'); return; }
    root.innerHTML =
      '<div class="mask" data-mask>' +
        '<div class="sheet">' + html + '</div>' +
      '</div>';
    var mask = root.querySelector('[data-mask]');
    if (mask) {
      mask.addEventListener('click', function (e) {
        if (e.target === mask) closeModal();
      });
    }
    if (onMount) onMount(root.querySelector('.sheet'));
  }

  function closeModal() {
    var root = getModalRoot();
    if (root) root.innerHTML = '';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ================= status ================= */

  function parseStatus(out) {
    var kv = {}, items = [];
    out.split('\n').forEach(function (line) {
      line = line.replace(/\r$/, '');
      if (line.indexOf('ITEM=') === 0) {
        var p = line.slice(5).split('|');
        items.push({
          id: p[0], type: p[1],
          enabled: p[2] === '1',
          effective: p[3] === '1',
          pinned: p[4] === '1',
          title: p.slice(5).join('|')
        });
        return;
      }
      var i = line.indexOf('=');
      if (i > 0) kv[line.slice(0, i)] = line.slice(i + 1);
    });
    return {
      color: kv.COLOR || 'red',
      total: parseInt(kv.TOTAL || '0', 10) || 0,
      enabled: parseInt(kv.ENABLED || '0', 10) || 0,
      effective: parseInt(kv.EFFECTIVE || '0', 10) || 0,
      items: items
    };
  }

  function refresh() {
    return exec('sh ' + SCRIPTS + '/status.sh').then(function (r) {
      if (!r.stdout) return;
      var st = parseStatus(r.stdout);
      S.color = st.color; S.total = st.total;
      S.enabled = st.enabled; S.effective = st.effective;
      S.items = st.items;
      renderHero();
      renderList();
    });
  }

  function renderHero() {
    var hero = document.getElementById('hero');
    hero.setAttribute('data-color', S.color);

    var title, sub;
    if (S.color === 'green') { title = t('st_green'); sub = t('st_green_sub'); }
    else if (S.color === 'yellow') { title = t('st_yellow'); sub = t('st_yellow_sub'); }
    else if (S.enabled === 0) { title = t('st_red_none'); sub = t('st_red_none_sub'); }
    else { title = t('st_red_fail'); sub = t('st_red_fail_sub'); }

    document.getElementById('heroTitle').textContent = title;
    document.getElementById('heroSub').textContent = sub;
    document.getElementById('cntTotal').textContent = S.total;
    document.getElementById('cntActive').textContent = S.effective;
  }

  /* ================= list rendering ================= */

  var ICON_CA =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
    '<path d="M14 2v6h6"/></svg>';
  var ICON_KB =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8z"/>' +
    '<path d="M15.5 7.5l3 3L22 7l-3-3"/></svg>';
  var ICON_TOGGLE_ON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20 6L9 17l-5-5"/></svg>';
  var ICON_TOGGLE_OFF =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
    '<path d="M18 6L6 18M6 6l12 12"/></svg>';
  var ICON_PIN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 17v5M9 3h6l-1 6 4 4H6l4-4z"/></svg>';
  var ICON_TRASH =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>';

  function renderList() {
    var box = document.getElementById('list');
    var empty = document.getElementById('empty');

    if (!S.items.length) {
      box.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    box.innerHTML = S.items.map(function (it) {
      var badge, cls;
      if (!it.enabled) { badge = 'off'; cls = t('b_disabled'); }
      else if (it.effective) { badge = 'ok'; cls = t('b_active'); }
      else { badge = 'wait'; cls = t('b_pending'); }

      var typeLabel = t('type_ca');

      return '' +
        '<div class="item' + (it.enabled ? '' : ' disabled') + '" data-type="' + esc(it.type) + '" data-id="' + esc(it.id) + '">' +
          '<div class="item-main">' +
            '<div class="item-icon">' + ICON_CA + '</div>' +
            '<div class="item-info">' +
              '<div class="item-title">' + esc(it.title || it.id) + '</div>' +
              '<div class="item-meta">' +
                '<span>' + esc(typeLabel) + '</span>' +
                '<span class="badge ' + badge + '">' + esc(cls) + '</span>' +
                (it.pinned ? '<span class="badge pin">' + esc(t('b_pinned')) + '</span>' : '') +
              '</div>' +
            '</div>' +
            '<div class="item-actions">' +
              '<button class="act' + (it.enabled ? ' on' : '') + '" data-act="toggle" title="' + esc(t(it.enabled ? 'a_disable' : 'a_enable')) + '">' +
                (it.enabled ? ICON_TOGGLE_ON : ICON_TOGGLE_OFF) + '</button>' +
              '<button class="act' + (it.pinned ? ' on' : '') + '" data-act="pin" title="' + esc(t(it.pinned ? 'a_unpin' : 'a_pin')) + '">' +
                ICON_PIN + '</button>' +
              '<button class="act danger" data-act="delete" title="' + esc(t('a_delete')) + '">' +
                ICON_TRASH + '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    box.querySelectorAll('.item').forEach(function (el) {
      var id = el.getAttribute('data-id');
      el.querySelectorAll('[data-act]').forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          var act = btn.getAttribute('data-act');
          if (act === 'toggle') doToggle(id);
          else if (act === 'pin') doPin(id);
          else if (act === 'delete') confirmDelete(id);
        });
      });
    });
  }

  /* ================= item operations ================= */

  function setBusy(on, key) {
    S.busy = on;
    var el = document.getElementById('busy');
    el.hidden = !on;
    if (on && key) document.getElementById('busyText').textContent = t(key);
  }

  function doToggle(id) {
    exec('sh ' + SCRIPTS + '/list.sh toggle ' + shq(id)).then(refresh);
  }

  function doPin(id) {
    var it = S.items.filter(function (x) { return x.id === id; })[0];
    var cmd = it && it.pinned ? 'unpin' : 'pin';
    exec('sh ' + SCRIPTS + '/list.sh ' + cmd + ' ' + shq(id)).then(refresh);
  }

  function confirmDelete(id) {
    openModal(
      '<div class="sheet-head"><h3>' + esc(t('delete_title')) + '</h3></div>' +
      '<p>' + esc(t('delete_msg')) + '</p>' +
      '<div class="sheet-actions">' +
        '<button class="btn ghost" data-x="cancel">' + esc(t('cancel')) + '</button>' +
        '<button class="btn danger" data-x="ok">' + esc(t('a_delete')) + '</button>' +
      '</div>',
      function (sheet) {
        sheet.querySelector('[data-x="cancel"]').onclick = closeModal;
        sheet.querySelector('[data-x="ok"]').onclick = function () {
          closeModal();
          exec('sh ' + SCRIPTS + '/list.sh delete ' + shq(id)).then(refresh);
        };
      }
    );
  }

  /* ================= expose for later stages ================= */

  window.AnyCA = {
    S: S,
    exec: exec,
    shq: shq,
    t: t,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    esc: esc,
    refresh: refresh,
    setBusy: setBusy,
    applyI18n: applyI18n
  };
})();
