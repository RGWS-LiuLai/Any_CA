/*!
 * Any - CA :: webroot/i18n.ja.js  — 日本語
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 */
(function (root) {
  'use strict';
  var D = root.__ANYCA_I18N__; if (!D) return;
  D.T.ja = {
    total: '合計', active: '有効',
    st_green: 'すべて有効', st_green_sub: '有効な項目はすべて適用されています。',
    st_yellow: '一部有効', st_yellow_sub: '有効な項目の一部がまだ適用されていません。',
    st_red_none: '有効な項目なし', st_red_none_sub: '少なくとも 1 つ有効にしてください。',
    st_red_fail: '適用されていません', st_red_fail_sub: '有効な項目が適用されていません。再起動が必要な場合があります。',
    importCa: 'CA 証明書を信頼する',
    importCaSub: 'PEM/DER 証明書を選んでシステムストアに追加します',
    certList: '証明書', emptyList: 'まだ何もありません',
    b_active: '有効', b_pending: '保留中', b_disabled: '無効', type_ca: 'CA',
    a_disable: '無効化', a_enable: '有効化', a_pin: '固定', a_unpin: '固定解除',
    a_delete: '削除', a_export: 'エクスポート',
    confirm: '確認', cancel: 'キャンセル', ok: 'OK', close: '閉じる',
    delete_title: 'この項目を削除しますか？', delete_msg: '項目とインストール済みの証明書が削除されます。',
    busy_reading: 'ファイルを読み込み中…', busy_parsing: '証明書を解析中…',
    busy_writing: '書き込み中…', busy_generating: '鍵を生成中…', busy_installing: 'インストール中…',
    err_read: 'ファイルを読み込めません', err_nocert: 'このファイルに証明書がありません',
    err_noapi: 'WebUI API を利用できません — モジュールマネージャーから開いてください',
    err_notarget: 'システムのトラストストアが見つかりません',
    err_generic: '問題が発生しました',
    err_webcrypto: 'WebCrypto を利用できないため鍵を生成できません',
    language: '言語', lang_auto: 'システムに従う',
    about: 'このアプリについて', author: '作者', coolapk: 'Coolapk', github: 'GitHub',
    version: 'バージョン', license: 'ライセンス',
    license_note: 'GPL-3.0 でライセンスされています。本プロジェクトはオープンソースであり、クローズドソースでの再配布は禁止です。',
    ca_import_done: '証明書をインストールしました',
    ca_import_sub: 'モジュールのマウント後に信頼されます。',
    reboot_needed: '証明書を有効にするには再起動が必要な場合があります。',
    first_run_title: '始める前に',
    first_run_body: 'This module modifies the system trust store. Back up your data first and use it only on devices you own.',
    got_it: '了解'
  };
})(typeof self !== 'undefined' ? self : this);
