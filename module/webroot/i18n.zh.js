/*!
 * Any - CA :: webroot/i18n.zh.js  — Chinese (Simplified / Traditional)
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 */
(function (root) {
  'use strict';
  var D = root.__ANYCA_I18N__;
  if (!D) return;
  var T = D.T;

  var zhCN = {
    total: '总数', active: '生效',
    st_green: '全部生效', st_green_sub: '所有已启用项均已生效。',
    st_yellow: '部分生效', st_yellow_sub: '部分已启用项尚未生效。',
    st_red_none: '未启用任何项', st_red_none_sub: '启用至少一项后开始生效。',
    st_red_fail: '未生效', st_red_fail_sub: '已启用项未生效，可能需要重启设备。',
    importCa: '信任 CA 证书',
    importCaSub: '选择 PEM/DER 证书并加入系统信任库',
    certList: '证书列表', emptyList: '这里还什么都没有',
    b_active: '生效中', b_pending: '待生效', b_disabled: '已禁用', type_ca: 'CA',
    a_disable: '禁用', a_enable: '启用', a_pin: '置顶', a_unpin: '取消置顶',
    a_delete: '删除', a_export: '导出',
    confirm: '确认', cancel: '取消', ok: '确定', close: '关闭',
    delete_title: '删除这一项？', delete_msg: '该项及其已安装证书将被移除。',
    busy_reading: '正在读取文件…', busy_parsing: '正在解析证书…',
    busy_writing: '正在写入…', busy_generating: '正在生成密钥…', busy_installing: '正在安装…',
    err_read: '无法读取文件', err_nocert: '该文件中未找到证书',
    err_noapi: 'WebUI 接口不可用——请从模块管理器打开',
    err_notarget: '未找到系统信任库',
    err_generic: '出现错误', err_webcrypto: 'WebCrypto 不可用，无法生成密钥',
    language: '语言', lang_auto: '跟随系统',
    about: '关于', author: '作者', coolapk: '酷安', github: 'GitHub',
    version: '版本', license: '许可',
    license_note: '以 GPL-3.0 许可发布。本项目开源，禁止闭源再分发。',
    ca_import_done: '证书已安装', ca_import_sub: '模块挂载后生效。',
    reboot_required: '需要重启生效',
    reboot_needed: '可能需要重启设备才能使证书生效。',
    first_run_title: '开始之前',
    first_run_body: '本模块会修改系统信任库。请先备份数据，且仅用于你自己的设备。',
    got_it: '我知道了'
  };
  T.zh = zhCN;
  T.zh_CN = zhCN;

  var zhTW = Object.assign({}, zhCN, {
    total: '總數', active: '生效',
    st_green: '全部生效', st_green_sub: '所有已啟用項均已生效。',
    st_yellow: '部分生效', st_yellow_sub: '部分已啟用項尚未生效。',
    st_red_none: '未啟用任何項', st_red_none_sub: '啟用至少一項後開始生效。',
    st_red_fail: '未生效', st_red_fail_sub: '已啟用項未生效，可能需要重新啟動裝置。',
    importCa: '信任 CA 憑證',
    importCaSub: '選擇 PEM/DER 憑證並加入系統信任庫',
    certList: '憑證列表', emptyList: '這裡還什麼都沒有',
    b_active: '生效中', b_pending: '待生效', b_disabled: '已停用', type_ca: 'CA',
    a_disable: '停用', a_enable: '啟用', a_pin: '置頂', a_unpin: '取消置頂',
    a_delete: '刪除', a_export: '匯出',
    confirm: '確認', cancel: '取消', ok: '確定', close: '關閉',
    delete_title: '刪除這一項？', delete_msg: '該項及其已安裝憑證將被移除。',
    busy_reading: '正在讀取檔案…', busy_parsing: '正在解析憑證…',
    busy_writing: '正在寫入…', busy_generating: '正在產生金鑰…', busy_installing: '正在安裝…',
    err_read: '無法讀取檔案', err_nocert: '該檔案中未找到憑證',
    err_noapi: 'WebUI 介面不可用——請從模組管理器開啟',
    err_notarget: '未找到系統信任庫',
    err_generic: '發生錯誤', err_webcrypto: 'WebCrypto 不可用，無法產生金鑰',
    language: '語言', lang_auto: '跟隨系統',
    about: '關於', author: '作者', coolapk: '酷安', github: 'GitHub',
    version: '版本', license: '授權',
    license_note: '以 GPL-3.0 授權發佈。本專案開源，禁止閉源再散佈。',
    ca_import_done: '憑證已安裝', ca_import_sub: '模組掛載後生效。',
    reboot_required: '需要重新啟動生效',
    reboot_needed: '可能需要重新啟動裝置才能使憑證生效。',
    first_run_title: '開始之前',
    first_run_body: '本模組會修改系統信任庫。請先備份資料，且僅用於你自己的裝置。',
    got_it: '我知道了'
  });
  T.zh_TW = zhTW;
  T.zh_HK = zhTW;
  T.zh_MO = zhTW;
  T.zh_SG = zhCN;
})(typeof self !== 'undefined' ? self : this);
