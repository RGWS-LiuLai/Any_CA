/*!
 * Any - CA :: webroot/i18n.fr.js  — français
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 */
(function (root) {
  'use strict';
  var D = root.__ANYCA_I18N__; if (!D) return;
  D.T.fr = {
    total: 'Total', active: 'Actif',
    st_green: 'Tout actif', st_green_sub: 'Tous les éléments activés sont effectifs.',
    st_yellow: 'Partiellement actif', st_yellow_sub: 'Certains éléments activés ne sont pas encore effectifs.',
    st_red_none: 'Rien d’activé', st_red_none_sub: 'Activez au moins un élément.',
    st_red_fail: 'Non effectif', st_red_fail_sub: 'Les éléments activés ne sont pas effectifs. Un redémarrage peut être nécessaire.',
    importCa: 'Faire confiance à un certificat CA',
    importCaSub: 'Choisir un certificat PEM/DER et l’ajouter au magasin système',
    certList: 'Certificats', emptyList: 'Rien pour le moment',
    b_active: 'Actif', b_pending: 'En attente', b_disabled: 'Désactivé',
    type_keybox: 'Généré', type_ca: 'CA',
    a_disable: 'Désactiver', a_enable: 'Activer', a_pin: 'Épingler', a_unpin: 'Détacher',
    a_delete: 'Supprimer', a_export: 'Exporter',
    confirm: 'Confirmer', cancel: 'Annuler', ok: 'OK', close: 'Fermer',
    delete_title: 'Supprimer cet élément ?', delete_msg: 'L’élément et son certificat installé seront supprimés.',
    export_title: 'Exporter le keybox', exporting: 'Exportation…', export_done: 'Exporté',
    busy_reading: 'Lecture du fichier…', busy_parsing: 'Analyse des certificats…',
    busy_writing: 'Écriture des fichiers…', busy_generating: 'Génération des clés…', busy_installing: 'Installation…',
    err_read: 'Impossible de lire le fichier', err_nocert: 'Aucun certificat trouvé dans ce fichier',
    err_noapi: 'API WebUI indisponible — ouvrez depuis le gestionnaire de modules',
    err_notarget: 'Aucun magasin de confiance système trouvé',
    err_generic: 'Une erreur est survenue',
    err_webcrypto: 'WebCrypto indisponible — impossible de générer des clés',
    language: 'Langue', lang_auto: 'Suivre le système',
    about: 'À propos', author: 'Auteur', coolapk: 'Coolapk', github: 'GitHub',
    version: 'Version', license: 'Licence',
    license_note: 'Distribué sous GPL-3.0. Ce projet est open source ; la redistribution en code fermé est interdite.',
    gen_title: 'Générer un keybox',
    gen_disclaimer: 'Les trois modes sont réservés au divertissement et à l’auto-test. Aucun ne passe une certification Google — Google vérifie la chaîne sur ses propres serveurs, une chaîne auto-signée localement y est toujours rejetée.',
    gen_mode_oem: 'OEM auto-signé', gen_mode_oem_sub: 'Imite le fabricant de cet appareil',
    gen_mode_rkp: 'Style Google RKP', gen_mode_rkp_sub: 'Nommage Droid CA2 / Key Attestation CA1',
    gen_mode_hw: 'Style Google matériel', gen_mode_hw_sub: 'Racine avec numéro de série',
    gen_brand: 'Marque', gen_manufacturer: 'Fabricant',
    gen_serial: 'Numéro de série', gen_root_ca: 'Nom du CA racine',
    gen_generating: 'Génération…', gen_done: 'Keybox généré',
    gen_fake_detected: 'Un module de falsification d’appareil a été détecté ; ses valeurs sont utilisées et peuvent ne pas correspondre au matériel réel.',
    ca_import_done: 'Certificat installé',
    ca_import_sub: 'Il sera approuvé après le montage du module.',
    reboot_needed: 'Un redémarrage peut être nécessaire pour que le certificat prenne effet.',
    first_run_title: 'Avant de commencer',
    first_run_body: 'Ce module modifie le magasin de confiance système et interagit avec des modules de falsification TEE. Sauvegardez vos données et utilisez-le uniquement sur vos propres appareils. Les keybox générés sont réservés au divertissement et ne passent pas la certification Google.',
    got_it: 'Compris'
  };
})(typeof self !== 'undefined' ? self : this);
