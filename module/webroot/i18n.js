/*!
 * Any - CA :: webroot/i18n.js  (part 1: registry + English baseline)
 *
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思)
 * License: GPL-3.0 - https://github.com/RGWS-LiuLai/Any_CA
 *
 * Design: English is the complete baseline. Every other language
 * overrides only what it translates; missing keys fall back to
 * English so the UI never shows a raw key. Legacy codes (in, iw)
 * are aliased to their modern equivalents.
 */
(function (root) {
  'use strict';

  /* ---------------- language registry ---------------- */
  var LANGS = [
    ['af', 'Afrikaans'], ['am', 'አማርኛ'], ['ar', 'العربية'], ['az', 'azərbaycan'],
    ['be', 'беларуская'], ['bg', 'български'], ['bn', 'বাংলা'], ['bs', 'bosanski'],
    ['ca', 'català'], ['cs', 'čeština'], ['da', 'dansk'], ['de', 'Deutsch'],
    ['el', 'Ελληνικά'], ['en', 'English'], ['es', 'español'], ['et', 'eesti'],
    ['eu', 'euskara'], ['fa', 'فارسی'], ['fi', 'suomi'], ['fr', 'français'],
    ['gl', 'galego'], ['gu', 'ગુજરાતી'], ['hi', 'हिंदी'], ['hr', 'hrvatski'],
    ['hu', 'magyar'], ['hy', 'հայերեն'], ['id', 'Bahasa Indonesia'], ['is', 'íslenska'],
    ['it', 'italiano'], ['he', 'עברית'], ['ja', '日本語'], ['ka', 'ქართული'],
    ['kk', 'қазақ тілі'], ['km', 'ខ្មែរ'], ['kn', 'ಕನ್ನಡ'], ['ko', '한국어'],
    ['ky', 'кыргызча'], ['lo', 'ລາວ'], ['lt', 'lietuvių'], ['lv', 'latviešu'],
    ['mk', 'македонски'], ['ml', 'മലയാളം'], ['mn', 'монгол'], ['mr', 'मराठी'],
    ['ms', 'Bahasa Melayu'], ['my', 'မြန်မာ'], ['nb', 'norsk bokmål'], ['ne', 'नेपाली'],
    ['nl', 'Nederlands'], ['pa', 'ਪੰਜਾਬੀ'], ['pl', 'polski'], ['pt', 'português'],
    ['ro', 'română'], ['ru', 'русский'], ['si', 'සිංහල'], ['sk', 'slovenčina'],
    ['sl', 'slovenščina'], ['sq', 'shqip'], ['sr', 'српски / srpski'], ['sv', 'svenska'],
    ['sw', 'Kiswahili'], ['ta', 'தமிழ்'], ['te', 'తెలుగు'], ['th', 'ไทย'],
    ['tl', 'Tagalog'], ['tr', 'Türkçe'], ['uk', 'українська'], ['ur', 'اردو'],
    ['uz', 'o‘zbek'], ['vi', 'Tiếng Việt'], ['zh', '中文'], ['zh_CN', '简体中文'],
    ['zh_TW', '繁體中文'], ['zh_HK', '繁體中文（香港）'], ['zh_MO', '繁體中文（澳門）'],
    ['zh_SG', '简体中文（新加坡）'], ['zu', 'isiZulu']
  ];

  /* ---------------- legacy code aliases ---------------- */
  var ALIASES = {
    'in': 'id', 'iw': 'he',
    'zh-Hans': 'zh_CN', 'zh-Hant': 'zh_TW',
    'zh-CN': 'zh_CN', 'zh-TW': 'zh_TW', 'zh-HK': 'zh_HK',
    'zh-MO': 'zh_MO', 'zh-SG': 'zh_SG'
  };

  /* ---------------- English baseline (complete) ---------------- */
  var EN = {
    appName: 'Any - CA', total: 'Total', active: 'Active',
    st_green: 'All active', st_green_sub: 'Every enabled item is in effect.',
    st_yellow: 'Partially active', st_yellow_sub: 'Some enabled items are not in effect yet.',
    st_red_none: 'Nothing enabled', st_red_none_sub: 'Enable at least one item to start.',
    st_red_fail: 'Not in effect', st_red_fail_sub: 'Enabled items are not taking effect. A reboot may be required.',
    importCa: 'Trust a CA certificate',
    importCaSub: 'Pick a PEM/DER certificate and add it to the system store',
    certList: 'Certificates', emptyList: 'Nothing here yet',
    b_active: 'Active', b_pending: 'Pending', b_disabled: 'Disabled',
    type_keybox: 'Generated', type_ca: 'CA',
    a_disable: 'Disable', a_enable: 'Enable', a_pin: 'Pin', a_unpin: 'Unpin',
    a_delete: 'Delete', a_export: 'Export',
    confirm: 'Confirm', cancel: 'Cancel', ok: 'OK', close: 'Close',
    delete_title: 'Delete this item?',
    delete_msg: 'The item and its installed certificate will be removed.',
    export_title: 'Export keybox', exporting: 'Exporting…', export_done: 'Exported',
    busy_reading: 'Reading file…', busy_parsing: 'Parsing certificates…',
    busy_writing: 'Writing files…', busy_generating: 'Generating keys…', busy_installing: 'Installing…',
    err_read: 'Could not read the file', err_nocert: 'No certificate found in this file',
    err_noapi: 'WebUI API unavailable — open this from the module manager',
    err_notarget: 'No system trust store found on this device',
    err_generic: 'Something went wrong',
    err_webcrypto: 'WebCrypto unavailable — cannot generate keys',
    language: 'Language', lang_auto: 'Follow system',
    about: 'About', author: 'Author', coolapk: 'Coolapk', github: 'GitHub',
    version: 'Version', license: 'License',
    license_note: 'Licensed under GPL-3.0. This project is open source; closed-source redistribution is not permitted.', gen_mode_oem_sub: 'Imitates this device manufacturer', gen_mode_rkp_sub: 'Droid CA2 / Key Attestation CA1 naming', gen_mode_hw_sub: 'Serial-number bearing root', gen_manufacturer: 'Manufacturer', gen_root_ca: 'Root CA name', gen_done: 'Keybox generated',
    ca_import_done: 'Certificate installed',
    reboot_required: 'reboot required',
    ca_import_sub: 'It will be trusted after the module is mounted.',
    reboot_needed: 'A reboot may be required for the certificate to take effect.',
    first_run_title: 'Before you start',
    first_run_body: 'This module modifies the system trust store and interacts with TEE spoofing modules. Back up your data first and use it only on devices you own. Generated keyboxes are for entertainment only and cannot pass Google certification.',
    got_it: 'Got it'
  };

  var T = {};

  /* Publish the registry for the per-language files and i18n.core.js. */
  root.__ANYCA_I18N__ = { LANGS: LANGS, ALIASES: ALIASES, EN: EN, T: T };
})(typeof self !== 'undefined' ? self : this);
