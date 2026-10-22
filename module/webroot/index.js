/*!
 * AnyKeybox - module :: WebUI logic
 * Bilingual (auto + manual), auto dark/light theme, file picking,
 * certificate extraction, <hash>.<n> naming, state detection.
 *
 * AGPL-3.0 © RGWS-LiuLai. Open source — closed source use is forbidden.
 */
'use strict';

/* ================= constants ================= */

const MOD_ID = 'AnyKeybox_module';
const MOD_DIR = '/data/adb/modules/' + MOD_ID;
const APEX_DIR = '/apex/com.android.conscrypt/cacerts';
const SYS_DIR = '/system/etc/security/cacerts';
const STATE_FILE = MOD_DIR + '/state.txt';

/* ================= i18n ================= */

const I18N = {
  en: {
    subtitle: 'Keybox CA → System Trust Store',
    theme: 'Theme', lang: 'Language', about: 'About',
    status_none_title: 'No certificates imported',
    status_none_desc: 'Pick a keybox.xml (or any XML with certificates) below to install its CAs.',
    status_imported_title: 'Imported — not yet active',
    status_imported_desc: 'Source files are ready inside the module directory. The root manager has not mounted them yet.',
    status_active_title: 'Certificates mounted & trusted',
    status_active_desc: 'Your CA certificates are live in the system trust store. Re-picking a file replaces them.',
    meta_target: 'Target', meta_files: 'Files', meta_count: 'Certificates',
    pick_title: 'Select keybox.xml', pick_sub: 'Any XML containing certificates works',
    pick_title_busy: 'Working…', pick_sub_busy: 'Please wait',
    pathToggle: 'Or enter a file path manually', load: 'Load',
    steps_title: 'Next steps',
    steps_apex: ['Enable <b>AnyKeybox - module</b> in your root manager (KernelSU / Magisk / APatch).', '<b>Reboot the device.</b>'],
    steps_system: ['Enable <b>AnyKeybox - module</b> in your root manager (KernelSU / Magisk / APatch).', '<b>Reboot the device</b> or hot-reload mounts (works with NoMount-style managers).'],
    steps_note_apex: 'A reboot is required for APEX certificates: the manager injects them into the Zygote namespace at boot, so hot reload alone is usually not enough for running apps.',
    steps_note_system: 'Traditional /system/etc/security/cacerts target — reboot or hot reload both apply.',
    steps_active: ['All set — the certificates are mounted and trusted. Re-picking a file below will replace the installed CAs.', 'If they became active via <b>hot reload</b> (or you have not rebooted since importing), a <b>reboot is still recommended</b>: running apps do not reload the system trust store, so new certificates are only picked up by newly started processes.'],
    issue_title: 'Problem detected',
    issue_desc: 'Even after a reboot the certificates are still not fully active. You can report this to the author on GitHub Issues — a screenshot of this page makes the report much more useful.',
    issue_open: 'Open GitHub Issues',
    issue_later: 'Later',
    problem_title: 'Imported, but verification fails after reboot',
    problem_desc: 'The device has rebooted since importing, yet some checks still fail. Details below.',
    cert_mount: 'Mount', cert_der: 'Content', cert_zyg: 'Zygote', cert_app: 'App', cert_src: 'Source',
    about_tag: 'Import CA certificates from any keybox.xml into the Android system trust store.',
    err_no_manager: 'WebUI API unavailable — open this page from the KernelSU manager.',
    err_no_certs: 'No certificate found in that file',
    err_no_target: 'No certificate directory found on this device (neither APEX nor system cacerts)',
    err_read: 'Failed to read the file',
    ok_replaced: 'CA certificates imported successfully',
    ok_same: 'CA certificates imported (duplicates skipped)',
    confirm_replace: 'Replace the previously imported certificates?',
    status_checking: 'Checking status…',
    busy_extract: 'Extracting certificates…', busy_write: 'Writing files…',
    busy_clean: 'Cleaning up old certificates…',
    err_generic: 'Something went wrong'
  },
  zh: {
    subtitle: 'Keybox CA → 系统信任库',
    theme: '主题', lang: '语言', about: '关于',
    status_none_title: '尚未导入证书',
    status_none_desc: '在下方选择 keybox.xml（或任何包含证书的 XML），将其 CA 安装进系统。',
    status_imported_title: '源文件已导入，尚未生效',
    status_imported_desc: '证书已写入模块目录，但元模块（KernelSU/管理器）尚未将其挂载到系统。',
    status_active_title: '证书已挂载生效',
    status_active_desc: 'CA 证书已存在于系统信任库中。重新选择文件将替换它们。',
    meta_target: '目标路径', meta_files: '文件', meta_count: '证书数量',
    pick_title: '选择 keybox.xml 文件', pick_sub: '任何包含证书的 XML 均可',
    pick_title_busy: '正在处理…', pick_sub_busy: '请稍候',
    pathToggle: '或者手动输入文件路径', load: '读取',
    steps_title: '接下来的步骤',
    steps_apex: ['在元模块（KernelSU / Magisk / APatch）中<b>启用本模块</b>。', '<b>重启设备</b>。'],
    steps_system: ['在元模块（KernelSU / Magisk / APatch）中<b>启用本模块</b>。', '<b>重启设备</b>或热重载挂载（适用于 NoMount 类）。'],
    steps_note_apex: 'APEX 证书需要重启设备才能生效：元模块在启动时将其注入 Zygote 命名空间，仅热重载通常不足以让已运行的应用感知。',
    steps_note_system: '传统 /system/etc/security/cacerts 目标——重启或热重载均可。',
    steps_active: ['一切就绪——证书已挂载生效。重新选择文件将替换已安装的 CA。', '若证书是通过<b>热重载</b>在系统运行期间生效（或导入后尚未重启过），仍<b>建议重启一次设备</b>：已运行的应用不会自动重新加载系统信任库，新证书仅对之后新启动的进程生效。'],
    issue_title: '检测到问题',
    issue_desc: '重启之后证书仍未完全生效。可以到 GitHub Issues 向作者反馈——附上本页截图会让反馈更有用。',
    issue_open: '打开 GitHub Issues',
    issue_later: '稍后再说',
    problem_title: '已导入，但重启后验证仍未通过',
    problem_desc: '导入证书后设备已重启，但仍有检测项未通过，详情如下。',
    cert_mount: '挂载', cert_der: '内容', cert_zyg: 'Zygote', cert_app: '应用', cert_src: '源文件',
    about_tag: '将任意 keybox.xml 中的 CA 证书导入 Android 系统信任库。',
    err_no_manager: 'WebUI API 不可用——请从 KernelSU 管理器中打开本页面。',
    err_no_certs: '该文件中未提取到任何证书',
    err_no_target: '未找到系统证书目录（APEX 与传统路径均不存在）',
    err_read: '文件读取失败',
    ok_replaced: 'CA 证书导入成功',
    ok_same: 'CA 证书导入完成（已跳过重复项）',
    confirm_replace: '要替换之前导入的证书吗？',
    status_checking: '正在检测状态…',
    busy_extract: '正在提取证书…', busy_write: '正在写入文件…',
    busy_clean: '正在清理旧证书…',
    err_generic: '出现错误'
  }
};

let LANG = null;

function t(key) { return (I18N[LANG] && I18N[LANG][key]) != null ? I18N[LANG][key] : I18N.en[key]; }

function detectLang() {
  const saved = localStorage.getItem('ak_lang');
  if (saved === 'zh' || saved === 'en') return saved; // manual override
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.indexOf('zh') === 0 ? 'zh' : 'en';
}

function applyLang() {
  document.documentElement.lang = LANG;
  document.getElementById('subtitle').textContent = t('subtitle');
  document.getElementById('pickTitle').textContent = t('pick_title');
  document.getElementById('pickSub').textContent = t('pick_sub');
  document.getElementById('pathToggle').textContent = t('pathToggle');
  document.getElementById('pathGo').textContent = t('load');
  document.getElementById('stepsTitle').textContent = t('steps_title');
  document.getElementById('aboutTag').textContent = t('about_tag');
  document.getElementById('issueTitle').textContent = t('issue_title');
  document.getElementById('issueDesc').textContent = t('issue_desc');
  document.getElementById('issueOpen').textContent = t('issue_open');
  document.getElementById('issueLater').textContent = t('issue_later');
  document.getElementById('langLabel').textContent = LANG === 'zh' ? '中' : 'EN';
  document.getElementById('btnTheme').title = t('theme');
  document.getElementById('btnLang').title = t('lang');
  document.getElementById('btnAbout').title = t('about');
  renderStatus(); // re-render with new language
}

/* ================= theme ================= */

function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
}

function detectTheme() {
  const saved = localStorage.getItem('ak_theme');
  if (saved === 'light' || saved === 'dark') return saved; // manual override
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}

/* ================= KernelSU bridge ================= */

let KSU = null;
try { KSU = (typeof ksu !== 'undefined') ? ksu : (window.ksu || null); } catch (e) { KSU = null; }

let execSeq = 0;
function exec(cmd) {
  return new Promise(function (resolve) {
    if (!KSU || typeof KSU.exec !== 'function') {
      resolve({ errno: -1, stdout: '', stderr: 'no ksu api' });
      return;
    }
    const cb = '__akcb' + (++execSeq);
    window[cb] = function (errno, stdout, stderr) {
      try { delete window[cb]; } catch (e) { window[cb] = undefined; }
      resolve({ errno: errno | 0, stdout: String(stdout == null ? '' : stdout), stderr: String(stderr == null ? '' : stderr) });
    };
    try {
      KSU.exec(cmd, '{}', cb);
    } catch (e1) {
      try { KSU.exec(cmd, cb); } // legacy 2-arg signature
      catch (e2) { resolve({ errno: -1, stdout: '', stderr: String(e1 && e1.message || e1) }); }
    }
  });
}

function toast(msg, isErr) {
  if (KSU && typeof KSU.toast === 'function') {
    try { KSU.toast(msg); return; } catch (e) { /* fall through */ }
  }
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = isErr ? 'err' : '';
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(function () { el.hidden = true; }, 3200);
}

/* ================= status ================= */

let CURRENT = { status: 'CHECKING', mode: '', sysdir: '', files: [], count: 0 };

function parseStatusOutput(out) {
  const kv = {};
  const certs = [];
  out.split('\n').forEach(function (line) {
    const i = line.indexOf('=');
    if (i <= 0) return;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (k === 'CERT') {
      const o = {};
      v.split('|').forEach(function (p, idx) {
        const j = p.indexOf('=');
        if (idx === 0 && j < 0) o.name = p;
        else if (j > 0) o[p.slice(0, j)] = p.slice(j + 1);
      });
      if (o.name) certs.push(o);
    } else kv[k] = v;
  });
  return {
    status: kv.STATUS || 'NONE',
    mode: kv.MODE || '',
    sysdir: kv.SYSDIR || '',
    moddir: kv.MODDIR || MOD_DIR,
    count: parseInt(kv.COUNT || '0', 10) || 0,
    active: parseInt(kv.ACTIVE || '0', 10) || 0,
    files: (kv.FILES || '').split(',').filter(function (s) { return !!s; }),
    rebooted: kv.REBOOTED === '1',
    bootEpoch: kv.BOOTEPOCH || '0',
    certs: certs
  };
}

/** Collect per-certificate failures. Unknown checks ("") are ignored. */
function certFailures(certs) {
  const bad = [];
  (certs || []).forEach(function (c) {
    const fails = [];
    ['src', 'sys', 'der', 'zyg', 'app'].forEach(function (k) {
      if (c[k] === '0') fails.push(k);
    });
    if (fails.length) bad.push({ name: c.name, fails: fails });
  });
  return bad;
}

function refreshStatus(updateProp) {
  if (!KSU) { // graceful degrade outside the manager (e.g. static preview)
    CURRENT = { status: 'NONE', mode: '', sysdir: '', files: [], count: 0 };
    renderStatus();
    return Promise.resolve(CURRENT);
  }
  const args = updateProp ? '--update --print' : '--print';
  return exec('sh ' + MOD_DIR + '/scripts/status.sh ' + args).then(function (r) {
    if (!r.stdout) return CURRENT;
    CURRENT = parseStatusOutput(r.stdout);
    renderStatus();
    return CURRENT;
  });
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mark(v) { return v === '1' ? '✅' : v === '0' ? '❌' : '—'; }

function renderStatus() {
  const card = document.getElementById('statusCard');
  const title = document.getElementById('statusTitle');
  const desc = document.getElementById('statusDesc');
  const meta = document.getElementById('statusMeta');
  const steps = document.getElementById('stepsCard');

  const st = CURRENT.status;
  const bad = certFailures(CURRENT.certs);
  const problem = bad.length > 0 && CURRENT.rebooted; // 重启之后仍有失败 → 引导反馈

  card.setAttribute('data-state', problem ? 'error' : st === 'ACTIVE' ? 'active' : st === 'IMPORTED' ? 'imported' : 'none');

  if (st === 'CHECKING') {
    title.textContent = t('status_checking');
    desc.textContent = '';
    meta.className = 'status-meta';
    steps.hidden = true;
    return;
  }

  if (problem) {
    title.textContent = t('problem_title');
    desc.textContent = t('problem_desc');
  } else if (st === 'ACTIVE') {
    title.textContent = t('status_active_title');
    desc.textContent = t('status_active_desc');
  } else if (st === 'IMPORTED') {
    title.textContent = t('status_imported_title');
    desc.textContent = t('status_imported_desc');
  } else {
    title.textContent = t('status_none_title');
    desc.textContent = t('status_none_desc');
  }

  // meta rows: target / count / per-certificate verification matrix
  if (st !== 'NONE' && CURRENT.sysdir) {
    let html = '';
    html += '<div class="meta-row"><span class="meta-key">' + esc(t('meta_target')) + '</span><span>' + esc(CURRENT.sysdir) + '</span></div>';
    html += '<div class="meta-row"><span class="meta-key">' + esc(t('meta_count')) + '</span><span>' + CURRENT.count + '</span></div>';
    if (CURRENT.files.length) {
      html += '<div class="meta-row"><span class="meta-key">' + esc(t('meta_files')) + '</span><span>' + esc(CURRENT.files.join('  ')) + '</span></div>';
    }
    (CURRENT.certs || []).forEach(function (c) {
      html += '<div class="meta-row cert-row"><span class="meta-key cert-name">' + esc(c.name) + '</span></div>';
      html += '<div class="meta-row cert-checks"><span>'
        + '<span class="chk">' + esc(t('cert_mount')) + ' ' + mark(c.sys) + '</span>'
        + '<span class="chk">' + esc(t('cert_der')) + ' ' + mark(c.der) + '</span>'
        + '<span class="chk">' + esc(t('cert_zyg')) + ' ' + mark(c.zyg) + '</span>'
        + '<span class="chk">' + esc(t('cert_app')) + ' ' + mark(c.app) + '</span>'
        + '</span></div>';
    });
    meta.innerHTML = html;
    meta.className = 'status-meta show';
  } else {
    meta.className = 'status-meta';
  }

  // next-steps card
  if (problem) {
    const items = CURRENT.mode === 'apex' ? t('steps_apex') : t('steps_system');
    document.getElementById('stepsList').innerHTML = items.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    document.getElementById('stepsNote').textContent = t('issue_desc');
    steps.hidden = false;
  } else if (st === 'IMPORTED') {
    const items = CURRENT.mode === 'apex' ? t('steps_apex') : t('steps_system');
    document.getElementById('stepsList').innerHTML = items.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    document.getElementById('stepsNote').textContent = CURRENT.mode === 'apex' ? t('steps_note_apex') : t('steps_note_system');
    steps.hidden = false;
  } else if (st === 'ACTIVE') {
    const items = t('steps_active');
    document.getElementById('stepsList').innerHTML = (Array.isArray(items) ? items : [items])
      .map(function (s) { return '<li>' + s + '</li>'; }).join('');
    document.getElementById('stepsNote').textContent = '';
    steps.hidden = false;
  } else {
    steps.hidden = true;
  }

  // auto-prompt the issue report once per boot when failing after reboot
  if (problem) {
    const key = 'ak_issue_' + CURRENT.bootEpoch;
    if (localStorage.getItem(key) !== '1') {
      localStorage.setItem(key, '1');
      showIssueModal(bad);
    }
  }
}

function showIssueModal(bad) {
  const modal = document.getElementById('issueModal');
  const detail = document.getElementById('issueDetail');
  const labels = { src: t('cert_src'), sys: t('cert_mount'), der: t('cert_der'), zyg: t('cert_zyg'), app: t('cert_app') };
  let html = '';
  bad.forEach(function (b) {
    html += '<div class="issue-item"><span class="issue-file">' + esc(b.name) + '</span>'
      + b.fails.map(function (k) { return '<span class="issue-fail">' + esc(labels[k] || k) + ' ❌</span>'; }).join(' ')
      + '</div>';
  });
  detail.innerHTML = html;
  modal.hidden = false;
}

/* ================= certificate import ================= */

function shQuote(s) { return "'" + String(s).replace(/'/g, "'\\''") + "'"; }

function detectTarget() {
  return exec('if [ -d ' + shQuote(APEX_DIR) + ' ]; then echo apex; elif [ -d ' + shQuote(SYS_DIR) + ' ]; then echo system; fi')
    .then(function (r) {
      const m = r.stdout.trim();
      if (m !== 'apex' && m !== 'system') throw new Error('NO_TARGET');
      return m;
    });
}

function listFiles(dir) {
  return exec('ls -1 ' + shQuote(dir) + ' 2>/dev/null').then(function (r) {
    return r.stdout.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return !!s; });
  });
}

function readState() {
  return exec('cat ' + shQuote(STATE_FILE) + ' 2>/dev/null').then(function (r) {
    const st = { mode: '', files: [] };
    r.stdout.split('\n').forEach(function (line) {
      line = line.trim();
      if (line.indexOf('mode=') === 0) st.mode = line.slice(5);
      else if (line.indexOf('file=') === 0) st.files.push(line.slice(5));
    });
    return st;
  });
}

function writeState(mode, files) {
  let cmd = 'mkdir -p ' + shQuote(MOD_DIR) + ' && { ';
  cmd += 'echo mode=' + mode;
  files.forEach(function (f) { cmd += '; echo file=' + shQuote(f); });
  cmd += '; } > ' + shQuote(STATE_FILE) + ' && chmod 644 ' + shQuote(STATE_FILE);
  return exec(cmd);
}

function removeOldFiles(mode, files) {
  if (!files.length) return Promise.resolve();
  const dir = mode === 'apex' ? MOD_DIR + '/apex/com.android.conscrypt/cacerts' : MOD_DIR + '/system/etc/security/cacerts';
  let cmd = '';
  files.forEach(function (f) {
    cmd += 'rm -f ' + shQuote(dir + '/' + f) + '; ';
  });
  // tidy up empty directories left behind (best effort)
  cmd += 'rmdir ' + shQuote(dir) + ' ' + shQuote(dir.replace(/\/cacerts$/, '')) + ' ' + shQuote(dir.replace(/\/(cacerts)?$/, '').replace(/\/[^/]+$/, '')) + ' 2>/dev/null; true';
  return exec(cmd);
}

function writeCertFile(mode, name, pemText) {
  const dir = mode === 'apex' ? MOD_DIR + '/apex/com.android.conscrypt/cacerts' : MOD_DIR + '/system/etc/security/cacerts';
  const b64 = CertUtils.bytesToB64(new TextEncoder ? new TextEncoder().encode(pemText) : pemToBytes(pemText));
  const target = dir + '/' + name;
  const cmd = 'mkdir -p ' + shQuote(dir) +
    ' && echo ' + shQuote(b64) + ' | base64 -d > ' + shQuote(target) +
    ' && chmod 644 ' + shQuote(target) +
    ' && chown 0:0 ' + shQuote(target) +
    ' && { chcon u:object_r:system_file:s0 ' + shQuote(target) + ' 2>/dev/null || true; }';
  return exec(cmd).then(function (r) {
    if (r.errno !== 0) throw new Error('WRITE_FAIL: ' + (r.stderr || ('errno ' + r.errno)));
  });
}

function pemToBytes(str) { // latin1 fallback for very old WebViews
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
  return out;
}

function setBusy(on, textKey) {
  const prog = document.getElementById('pickProgress');
  const btn = document.getElementById('btnPick');
  prog.hidden = !on;
  btn.style.pointerEvents = on ? 'none' : '';
  btn.style.opacity = on ? '.55' : '';
  if (on && textKey) document.getElementById('progressText').textContent = t(textKey);
}

function importCerts(text) {
  setBusy(true, 'busy_extract');
  let mode = null;
  return detectTarget()
    .then(function (m) { mode = m; return listFiles(mode === 'apex' ? APEX_DIR : SYS_DIR); })
    .then(function (sysFiles) {
      // extract & dedupe
      const pems = CertUtils.extractPEMs(text);
      if (!pems.length) throw new Error('NO_CERTS');
      const seen = {};
      const uniq = [];
      pems.forEach(function (p) {
        const norm = CertUtils.normalizePEM(p);
        const key = norm.replace(/\s+/g, '');
        if (!seen[key]) { seen[key] = 1; uniq.push(norm); }
      });
      // compute hashes
      const certs = uniq.map(function (pem) {
        const der = CertUtils.pemToDer(pem);
        const hash = CertUtils.subjectHashHex(der);
        if (!hash) throw new Error('BAD_CERT');
        return { pem: pem, hash: hash };
      });

      setBusy(true, 'busy_clean');
      // existing names for collision handling: module dir + system dir
      const modDir = mode === 'apex' ? MOD_DIR + '/apex/com.android.conscrypt/cacerts' : MOD_DIR + '/system/etc/security/cacerts';
      return readState().then(function (old) {
        return listFiles(modDir).then(function (modFiles) {
          const taken = {};
          sysFiles.forEach(function (f) { taken[f] = 1; });
          modFiles.forEach(function (f) { taken[f] = 1; });

          setBusy(true, 'busy_write');
          // assign <hash>.<n>
          certs.forEach(function (c) {
            let n = 0;
            while (taken[c.hash + '.' + n]) n++;
            c.name = c.hash + '.' + n;
            taken[c.name] = 1;
          });

          // remove previously imported files (re-pick replaces)
          return removeOldFiles(old.mode || mode, old.files).then(function () {
            // write new certs sequentially
            let chain = Promise.resolve();
            certs.forEach(function (c) {
              chain = chain.then(function () { return writeCertFile(mode, c.name, c.pem); });
            });
            return chain.then(function () {
              return writeState(mode, certs.map(function (c) { return c.name; }));
            });
          });
        });
      });
    })
    .then(function () { return refreshStatus(true); })
    .then(function () {
      setBusy(false);
      toast(t('ok_replaced'));
    })
    .catch(function (e) {
      setBusy(false);
      const msgMap = { NO_CERTS: 'err_no_certs', NO_TARGET: 'err_no_target', BAD_CERT: 'err_no_certs' };
      const key = msgMap[e && e.message] || 'err_generic';
      toast(t(key) + (key === 'err_generic' ? ' (' + (e && e.message || e) + ')' : ''), true);
      return refreshStatus(true);
    });
}

/* ================= file picking ================= */

function bindPick() {
  const input = document.getElementById('fileInput');
  document.getElementById('btnPick').addEventListener('click', function () {
    if (!KSU) { toast(t('err_no_manager'), true); return; }
    input.click();
  });
  input.addEventListener('change', function () {
    const f = input.files && input.files[0];
    input.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function () { importCerts(String(reader.result)); };
    reader.onerror = function () { toast(t('err_read'), true); };
    reader.readAsText(f);
  });

  // manual path fallback
  document.getElementById('pathToggle').addEventListener('click', function () {
    const row = document.getElementById('pathRow');
    row.hidden = !row.hidden;
  });
  document.getElementById('pathGo').addEventListener('click', function () {
    const p = document.getElementById('pathInput').value.trim();
    if (!p) return;
    if (!KSU) { toast(t('err_no_manager'), true); return; }
    setBusy(true, 'busy_extract');
    exec('cat ' + shQuote(p) + ' 2>/dev/null | head -c 4194304').then(function (r) {
      setBusy(false);
      if (r.errno !== 0 || !r.stdout) { toast(t('err_read'), true); return; }
      importCerts(r.stdout);
    });
  });
}

/* ================= about modal ================= */

function bindAbout() {
  const modal = document.getElementById('aboutModal');
  document.getElementById('btnAbout').addEventListener('click', function () { modal.hidden = false; });
  document.getElementById('aboutClose').addEventListener('click', function () { modal.hidden = true; });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.hidden = true; });
  modal.querySelectorAll('a[data-url]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      const url = a.getAttribute('data-url');
      if (KSU) exec('am start -a android.intent.action.VIEW -d ' + shQuote(url) + ' >/dev/null 2>&1');
      else window.open(url, '_blank');
    });
  });
}

function bindIssueModal() {
  const modal = document.getElementById('issueModal');
  const ISSUES_URL = 'https://github.com/RGWS-LiuLai/Anykeybox_module/issues';
  document.getElementById('issueClose').addEventListener('click', function () { modal.hidden = true; });
  document.getElementById('issueLater').addEventListener('click', function () { modal.hidden = true; });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.hidden = true; });
  document.getElementById('issueOpen').addEventListener('click', function () {
    if (KSU) exec('am start -a android.intent.action.VIEW -d ' + shQuote(ISSUES_URL) + ' >/dev/null 2>&1');
    else window.open(ISSUES_URL, '_blank');
    modal.hidden = true;
  });
}

/* ================= header buttons ================= */

function bindHeader() {
  document.getElementById('btnTheme').addEventListener('click', function () {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ak_theme', cur); // manual override stops auto detection
    applyTheme(cur);
  });
  document.getElementById('btnLang').addEventListener('click', function () {
    LANG = LANG === 'zh' ? 'en' : 'zh';
    localStorage.setItem('ak_lang', LANG); // manual override stops auto detection
    applyLang();
  });
}

/* ================= boot ================= */

function boot() {
  applyTheme(detectTheme());
  LANG = detectLang();
  applyLang();
  bindHeader();
  bindPick();
  bindAbout();
  bindIssueModal();
  refreshStatus(false);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
