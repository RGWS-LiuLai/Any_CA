/*!
 * Any - CA :: webroot/i18n.ru.js  — русский
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 */
(function (root) {
  'use strict';
  var D = root.__ANYCA_I18N__; if (!D) return;
  D.T.ru = {
    total: 'Всего', active: 'Активно',
    st_green: 'Всё активно', st_green_sub: 'Все включённые элементы действуют.',
    st_yellow: 'Частично активно', st_yellow_sub: 'Некоторые включённые элементы ещё не действуют.',
    st_red_none: 'Ничего не включено', st_red_none_sub: 'Включите хотя бы один элемент.',
    st_red_fail: 'Не действует', st_red_fail_sub: 'Включённые элементы не действуют. Возможно, нужна перезагрузка.',
    importCa: 'Доверять сертификату CA',
    importCaSub: 'Выберите сертификат PEM/DER и добавьте его в системное хранилище',
    certList: 'Сертификаты', emptyList: 'Здесь пока пусто',
    b_active: 'Активно', b_pending: 'Ожидает', b_disabled: 'Отключено', type_ca: 'CA',
    a_disable: 'Отключить', a_enable: 'Включить', a_pin: 'Закрепить', a_unpin: 'Открепить',
    a_delete: 'Удалить', a_export: 'Экспорт',
    confirm: 'Подтвердить', cancel: 'Отмена', ok: 'ОК', close: 'Закрыть',
    delete_title: 'Удалить этот элемент?', delete_msg: 'Элемент и установленный сертификат будут удалены.',
    busy_reading: 'Чтение файла…', busy_parsing: 'Разбор сертификатов…',
    busy_writing: 'Запись файлов…', busy_generating: 'Генерация ключей…', busy_installing: 'Установка…',
    err_read: 'Не удалось прочитать файл', err_nocert: 'В этом файле нет сертификата',
    err_noapi: 'API WebUI недоступен — откройте из менеджера модулей',
    err_notarget: 'Системное хранилище доверия не найдено',
    err_generic: 'Что-то пошло не так',
    err_webcrypto: 'WebCrypto недоступен — нельзя создать ключи',
    language: 'Язык', lang_auto: 'Как в системе',
    about: 'О программе', author: 'Автор', coolapk: 'Coolapk', github: 'GitHub',
    version: 'Версия', license: 'Лицензия',
    license_note: 'Распространяется по лицензии GPL-3.0. Проект открытый; закрытое распространение запрещено.',
    ca_import_done: 'Сертификат установлен',
    ca_import_sub: 'Он станет доверенным после монтирования модуля.',
    reboot_needed: 'Для вступления в силу может потребоваться перезагрузка.',
    first_run_title: 'Перед началом',
    first_run_body: 'This module modifies the system trust store. Back up your data first and use it only on devices you own.',
    got_it: 'Понятно'
  };
})(typeof self !== 'undefined' ? self : this);
