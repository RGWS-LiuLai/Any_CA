/*!
 * Any - CA :: webroot/i18n.de.js  — Deutsch
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 */
(function (root) {
  'use strict';
  var D = root.__ANYCA_I18N__; if (!D) return;
  D.T.de = {
    total: 'Gesamt', active: 'Aktiv',
    st_green: 'Alles aktiv', st_green_sub: 'Alle aktivierten Einträge sind wirksam.',
    st_yellow: 'Teilweise aktiv', st_yellow_sub: 'Einige aktivierte Einträge sind noch nicht wirksam.',
    st_red_none: 'Nichts aktiviert', st_red_none_sub: 'Aktivieren Sie mindestens einen Eintrag.',
    st_red_fail: 'Nicht wirksam', st_red_fail_sub: 'Aktivierte Einträge sind nicht wirksam. Möglicherweise ist ein Neustart nötig.',
    importCa: 'CA-Zertifikat vertrauen',
    importCaSub: 'PEM/DER-Zertifikat wählen und in den Systemspeicher aufnehmen',
    certList: 'Zertifikate', emptyList: 'Noch nichts vorhanden',
    b_active: 'Aktiv', b_pending: 'Ausstehend', b_disabled: 'Deaktiviert',
    type_keybox: 'Erzeugt', type_ca: 'CA',
    a_disable: 'Deaktivieren', a_enable: 'Aktivieren', a_pin: 'Anheften', a_unpin: 'Lösen',
    a_delete: 'Löschen', a_export: 'Exportieren',
    confirm: 'Bestätigen', cancel: 'Abbrechen', ok: 'OK', close: 'Schließen',
    delete_title: 'Diesen Eintrag löschen?', delete_msg: 'Der Eintrag und sein installiertes Zertifikat werden entfernt.',
    export_title: 'keybox exportieren', exporting: 'Wird exportiert…', export_done: 'Exportiert',
    busy_reading: 'Datei wird gelesen…', busy_parsing: 'Zertifikate werden analysiert…',
    busy_writing: 'Dateien werden geschrieben…', busy_generating: 'Schlüssel werden erzeugt…', busy_installing: 'Wird installiert…',
    err_read: 'Datei konnte nicht gelesen werden', err_nocert: 'Kein Zertifikat in dieser Datei gefunden',
    err_noapi: 'WebUI-API nicht verfügbar — über den Modulmanager öffnen',
    err_notarget: 'Kein System-Truststore gefunden',
    err_generic: 'Etwas ist schiefgelaufen',
    err_webcrypto: 'WebCrypto nicht verfügbar — Schlüssel können nicht erzeugt werden',
    language: 'Sprache', lang_auto: 'System folgen',
    about: 'Über', author: 'Autor', coolapk: 'Coolapk', github: 'GitHub',
    version: 'Version', license: 'Lizenz',
    license_note: 'Lizenziert unter GPL-3.0. Dieses Projekt ist quelloffen; Closed-Source-Weitergabe ist nicht erlaubt.',
    gen_title: 'keybox erzeugen',
    gen_disclaimer: 'Alle drei Modi dienen nur der Unterhaltung und Selbsttests. Keiner davon besteht eine Google-Zertifizierung — Google prüft die Kette auf seinen eigenen Servern, eine lokal selbstsignierte Kette wird dort immer abgelehnt.',
    gen_mode_oem: 'OEM selbstsigniert', gen_mode_oem_sub: 'Ahmt diesen Gerätehersteller nach',
    gen_mode_rkp: 'Google-RKP-Stil', gen_mode_rkp_sub: 'Benennung Droid CA2 / Key Attestation CA1',
    gen_mode_hw: 'Google-Hardware-Stil', gen_mode_hw_sub: 'Root mit Seriennummer',
    gen_brand: 'Marke', gen_manufacturer: 'Hersteller',
    gen_serial: 'Seriennummer', gen_root_ca: 'Root-CA-Name',
    gen_generating: 'Wird erzeugt…', gen_done: 'keybox erzeugt',
    gen_fake_detected: 'Ein Geräte-Spoofing-Modul wurde erkannt; seine Werte werden verwendet und passen evtl. nicht zur echten Hardware.',
    ca_import_done: 'Zertifikat installiert',
    ca_import_sub: 'Es wird vertraut, sobald das Modul eingebunden ist.',
    reboot_needed: 'Möglicherweise ist ein Neustart nötig, damit das Zertifikat wirkt.',
    first_run_title: 'Bevor Sie beginnen',
    first_run_body: 'Dieses Modul verändert den System-Truststore und arbeitet mit TEE-Spoofing-Modulen zusammen. Sichern Sie zuerst Ihre Daten und nutzen Sie es nur auf eigenen Geräten. Erzeugte keyboxen dienen nur der Unterhaltung und bestehen keine Google-Zertifizierung.',
    got_it: 'Verstanden'
  };
})(typeof self !== 'undefined' ? self : this);
