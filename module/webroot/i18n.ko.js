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
    b_active: '적용됨', b_pending: '대기 중', b_disabled: '비활성',
    type_keybox: '생성됨', type_ca: 'CA',
    a_disable: '비활성화', a_enable: '활성화', a_pin: '고정', a_unpin: '고정 해제',
    a_delete: '삭제', a_export: '내보내기',
    confirm: '확인', cancel: '취소', ok: '확인', close: '닫기',
    delete_title: '이 항목을 삭제할까요?', delete_msg: '항목과 설치된 인증서가 제거됩니다.',
    export_title: 'keybox 내보내기', exporting: '내보내는 중…', export_done: '내보냈습니다',
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
    gen_title: 'keybox 생성',
    gen_disclaimer: '세 가지 모드는 모두 오락과 자체 테스트 전용입니다. 어느 것도 Google 인증을 통과할 수 없습니다 — Google은 자체 서버에서 인증 체인을 검증하므로 로컬 자체 서명 체인은 항상 거부됩니다.',
    gen_mode_oem: 'OEM 자체 서명', gen_mode_oem_sub: '이 기기의 제조사 모방',
    gen_mode_rkp: 'Google RKP 스타일', gen_mode_rkp_sub: 'Droid CA2 / Key Attestation CA1 명명',
    gen_mode_hw: 'Google 하드웨어 스타일', gen_mode_hw_sub: '일련번호가 있는 루트',
    gen_brand: '브랜드', gen_manufacturer: '제조사',
    gen_serial: '일련번호', gen_root_ca: '루트 CA 이름',
    gen_generating: '생성 중…', gen_done: 'keybox 생성됨',
    gen_fake_detected: '기기 위장 모듈이 감지되었습니다. 해당 값을 사용하며 실제 하드웨어와 다를 수 있습니다.',
    ca_import_done: '인증서 설치됨',
    ca_import_sub: '모듈이 마운트된 후 신뢰됩니다.',
    reboot_needed: '인증서를 적용하려면 재부팅이 필요할 수 있습니다.',
    first_run_title: '시작하기 전에',
    first_run_body: '이 모듈은 시스템 신뢰 저장소를 수정하고 TEE 위장 모듈과 상호 작용합니다. 먼저 데이터를 백업하고 소유한 기기에서만 사용하세요. 생성된 keybox는 오락용이며 Google 인증을 통과할 수 없습니다.',
    got_it: '확인'
  };
})(typeof self !== 'undefined' ? self : this);
