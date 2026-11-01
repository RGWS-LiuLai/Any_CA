/*!
 * Any - CA :: webroot/i18n.es.js  — español
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 */
(function (root) {
  'use strict';
  var D = root.__ANYCA_I18N__; if (!D) return;
  D.T.es = {
    total: 'Total', active: 'Activo',
    st_green: 'Todo activo', st_green_sub: 'Todos los elementos activados están en efecto.',
    st_yellow: 'Parcialmente activo', st_yellow_sub: 'Algunos elementos activados aún no están en efecto.',
    st_red_none: 'Nada activado', st_red_none_sub: 'Activa al menos un elemento.',
    st_red_fail: 'Sin efecto', st_red_fail_sub: 'Los elementos activados no están en efecto. Puede requerirse un reinicio.',
    importCa: 'Confiar en un certificado CA',
    importCaSub: 'Elige un certificado PEM/DER y añádelo al almacén del sistema',
    certList: 'Certificados', emptyList: 'Aún no hay nada',
    b_active: 'Activo', b_pending: 'Pendiente', b_disabled: 'Desactivado', type_ca: 'CA',
    a_disable: 'Desactivar', a_enable: 'Activar', a_pin: 'Fijar', a_unpin: 'Soltar',
    a_delete: 'Eliminar', a_export: 'Exportar',
    confirm: 'Confirmar', cancel: 'Cancelar', ok: 'Aceptar', close: 'Cerrar',
    delete_title: '¿Eliminar este elemento?', delete_msg: 'El elemento y su certificado instalado se eliminarán.',
    busy_reading: 'Leyendo archivo…', busy_parsing: 'Analizando certificados…',
    busy_writing: 'Escribiendo archivos…', busy_generating: 'Generando claves…', busy_installing: 'Instalando…',
    err_read: 'No se pudo leer el archivo', err_nocert: 'No se encontró ningún certificado en este archivo',
    err_noapi: 'API de WebUI no disponible — ábrelo desde el gestor de módulos',
    err_notarget: 'No se encontró el almacén de confianza del sistema',
    err_generic: 'Algo salió mal',
    err_webcrypto: 'WebCrypto no disponible — no se pueden generar claves',
    language: 'Idioma', lang_auto: 'Seguir al sistema',
    about: 'Acerca de', author: 'Autor', coolapk: 'Coolapk', github: 'GitHub',
    version: 'Versión', license: 'Licencia',
    license_note: 'Licenciado bajo GPL-3.0. Este proyecto es de código abierto; no se permite la redistribución en código cerrado.',
    ca_import_done: 'Certificado instalado',
    ca_import_sub: 'Será de confianza tras montar el módulo.',
    reboot_needed: 'Puede requerirse un reinicio para que el certificado tenga efecto.',
    first_run_title: 'Antes de empezar',
    first_run_body: 'This module modifies the system trust store. Back up your data first and use it only on devices you own.',
    got_it: 'Entendido'
  };
})(typeof self !== 'undefined' ? self : this);
