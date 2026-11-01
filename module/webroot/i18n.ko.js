/*!
 * Any - CA :: webroot/i18n.ko.js  — 한국어
 * Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
 */
(function (root) {
  'use strict';
  var D = root.__ANYCA_I18N__; if (!D) return;
  D.T.ko = {
    total: '전체', active: '적용됨',
    st_green: '모두 적용됨', st_green_sub: '활성화된 모든 항목이 적용되었습니다.',
    st_yellow: '일부 적용됨', st_yellow_sub: '활성화된 항목 중 일부가 아직 적용되지 않았습니다.',
    st_red_none: '활성화된 항목 없음', st_red_none_sub: '최소 하나를 활성화하세요.',
    st_red_fail: '적용되지 않음', st_red_fail_sub: '활성화된 항목이 적용되지 않았습니다. 재부팅이 필요할 수 있습니다.',
    importCa: 'CA 인증서 신뢰',
    importCaSub: 'PEM/DER 인증서를 선택해 시스템 저장소에 추가합니다',
    certList: '인증서', emptyList: '아직 아무것도 없습니다',
    b_active: '적용됨', b_pending: '대기 중', b_disabled: '비활성', type_ca: 'CA',
    a_disable: '비활성화', a_enable: '활성화', a_pin: '고정', a_unpin: '고정 해제',
    a_delete: '삭제', a_export: '내보내기',
    confirm: '확인', cancel: '취소', ok: '확인', close: '닫기',
    delete_title: '이 항목을 삭제할까요?', delete_msg: '항목과 설치된 인증서가 제거됩니다.',
    busy_reading: '파일 읽는 중…', busy_parsing: '인증서 분석 중…',
    busy_writing: '파일 쓰는 중…', busy_generating: '키 생성 중…', busy_installing: '설치 중…',
    err_read: '파일을 읽을 수 없습니다', err_nocert: '이 파일에서 인증서를 찾을 수 없습니다',
    err_noapi: 'WebUI API를 사용할 수 없습니다 — 모듈 관리자에서 여세요',
    err_notarget: '시스템 신뢰 저장소를 찾을 수 없습니다',
    err_generic: '문제가 발생했습니다',
    err_webcrypto: 'WebCrypto를 사용할 수 없어 키를 생성할 수 없습니다',
    language: '언어', lang_auto: '시스템 따르기',
    about: '정보', author: '제작자', coolapk: 'Coolapk', github: 'GitHub',
    version: '버전', license: '라이선스',
    license_note: 'GPL-3.0으로 배포됩니다. 본 프로젝트는 오픈 소스이며 폐쇄 소스 재배포는 금지됩니다.',
    ca_import_done: '인증서 설치됨',
    ca_import_sub: '모듈이 마운트된 후 신뢰됩니다.',
    reboot_needed: '인증서를 적용하려면 재부팅이 필요할 수 있습니다.',
    first_run_title: '시작하기 전에',
    first_run_body: 'This module modifies the system trust store. Back up your data first and use it only on devices you own.',
    got_it: '확인'
  };
})(typeof self !== 'undefined' ? self : this);
