/*!
 * AnyKeybox - module :: hashlib.js
 * X.509 utilities for the WebUI: PEM extraction, DER parsing and the
 * Android system CA file-name hash (<hash>.<n>, e.g. 7bf5d5c8.0).
 *
 * File-name hash algorithm (verified against the device's own
 * /apex/com.android.conscrypt/cacerts entries — 149/149):
 *   MD5 over the raw DER encoding of the certificate Subject
 *   (the complete X.501 Name TLV, as-encoded in the certificate,
 *   no canonicalization), first 4 bytes assembled little-endian,
 *   printed as 8 hex digits. This is BoringSSL's X509_NAME_hash as
 *   used by Android's conscrypt TrustedCertificateStore. The ".n"
 *   suffix disambiguates different certificates sharing the same
 *   subject hash: n starts at 0 and increments on collision.
 *
 * Part of AnyKeybox - module (https://github.com/RGWS-LiuLai/Anykeybox_module)
 * GPL-3.0 © RGWS-LiuLai. Open source — closed source use is forbidden.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.CertUtils = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ================= PEM ================= */

  const PEM_RE = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g;

  /** Extract every PEM certificate block found in a text (XML or plain). */
  function extractPEMs(text) {
    const m = String(text).match(PEM_RE) || [];
    return m.map(function (s) { return s.trim(); });
  }

  function _b64ToBytes(b64) {
    if (typeof atob === 'function') {
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
    throw new Error('no base64 decoder');
  }

  function _bytesToB64(bytes) {
    if (typeof btoa === 'function') {
      let s = '';
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return btoa(s);
    }
    if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
    throw new Error('no base64 encoder');
  }

  /** DER bytes of a PEM block. */
  function pemToDer(pem) {
    const body = String(pem)
      .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
      .replace(/\s+/g, '');
    return _b64ToBytes(body);
  }

  /** Normalize a PEM block to 64-char lines (OpenSSL convention). */
  function normalizePEM(pem) {
    const body = String(pem)
      .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
      .replace(/\s+/g, '');
    const lines = body.replace(/(.{64})/g, '$1\n');
    return '-----BEGIN CERTIFICATE-----\n' + lines + '\n-----END CERTIFICATE-----\n';
  }

  /* ================= DER ================= */

  /** Read one TLV at `off`. Returns {tagOff, tag, valueOff, end} or null. */
  function readTLV(buf, off) {
    if (off == null || off + 2 > buf.length) return null;
    const tagOff = off;
    let p = off;
    const tag = buf[p++];          // p -> length byte
    if ((tag & 0x1f) === 0x1f) return null; // multi-byte tags unused in X.509
    let len = buf[p];
    if (len & 0x80) {
      const n = len & 0x7f;
      if (n === 0 || p + n > buf.length) return null;
      len = 0;
      for (let i = 0; i < n; i++) len = (len << 8) | buf[p + 1 + i];
      p += n;                       // p -> last length byte
    }
    p++;                            // p -> first value byte
    if (p + len > buf.length) return null;
    return { tagOff: tagOff, tag: tag, valueOff: p, end: p + len };
  }

  /** Parse all direct children TLVs between start and end. */
  function parseChildren(buf, start, end) {
    const out = [];
    let off = start;
    while (off < end) {
      const tlv = readTLV(buf, off);
      if (!tlv || tlv.end > end) return null;
      out.push(tlv);
      off = tlv.end;
    }
    return out;
  }

  /** Certificate DER -> Subject TLV (the X501 Name, a SEQUENCE). */
  function findSubjectTLV(der) {
    const cert = readTLV(der, 0);
    if (!cert || cert.tag !== 0x30) return null;
    const top = parseChildren(der, cert.valueOff, cert.end); // [ tbs, sigAlg, sigVal ]
    if (!top || top.length < 3 || top[0].tag !== 0x30) return null;
    const tbsTLV = top[0];
    const tbs = parseChildren(der, tbsTLV.valueOff, tbsTLV.end);
    if (!tbs || tbs.length < 6) return null;
    let idx = 0;
    if (tbs[0].tag === 0xa0) idx = 1; // optional [0] version
    // order: serial, sigAlg, issuer, validity, subject
    const subj = tbs[idx + 4];
    if (!subj || subj.tag !== 0x30) return null;
    return subj;
  }

  /* ================= MD5 (RFC 1321) ================= */

  function md5(inputBytes) {
    var bytes = inputBytes;
    var origLen = bytes.length;
    var bitLen = origLen * 8;
    var padded = Array.prototype.slice.call(bytes);
    padded.push(0x80);
    while (padded.length % 64 !== 56) padded.push(0);
    for (var i = 0; i < 8; i++) padded.push((bitLen / Math.pow(2, i * 8)) & 0xff);

    var S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
             5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
             4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
             6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
    var K = new Int32Array(64);
    for (var ki = 0; ki < 64; ki++) K[ki] = (Math.floor(Math.abs(Math.sin(ki + 1)) * 4294967296)) | 0;

    var a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

    function rotl(x, c) { return (x << c) | (x >>> (32 - c)); }

    for (var chunk = 0; chunk < padded.length; chunk += 64) {
      var M = new Int32Array(16);
      for (var j = 0; j < 16; j++) {
        M[j] = (padded[chunk + j * 4]) | (padded[chunk + j * 4 + 1] << 8) |
               (padded[chunk + j * 4 + 2] << 16) | (padded[chunk + j * 4 + 3] << 24);
      }
      var A = a0, B = b0, C = c0, D = d0;
      for (var k = 0; k < 64; k++) {
        var F, g;
        if (k < 16)      { F = (B & C) | (~B & D);           g = k; }
        else if (k < 32) { F = (D & B) | (~D & C);           g = (5 * k + 1) % 16; }
        else if (k < 48) { F = B ^ C ^ D;                    g = (3 * k + 5) % 16; }
        else             { F = C ^ (B | ~D);                 g = (7 * k) % 16; }
        F = (F + A + K[k] + M[g]) | 0;
        A = D; D = C; C = B;
        B = (B + rotl(F, S[k])) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    var out = [];
    var vals = [a0, b0, c0, d0];
    for (var v = 0; v < 4; v++) {
      for (var b = 0; b < 4; b++) out.push((vals[v] >>> (b * 8)) & 0xff);
    }
    return new Uint8Array(out);
  }

  /* ============ Android system CA file-name hash ============ */

  /**
   * Android system CA file-name hash of a certificate's Subject:
   * MD5(raw Subject DER TLV), first 4 bytes little-endian, 8 hex digits.
   * Matches the names used in /apex/com.android.conscrypt/cacerts and
   * /system/etc/security/cacerts.
   * @param {Uint8Array} der certificate DER
   * @returns {string} e.g. "7bf5d5c8", or null on parse failure
   */
  function subjectHashHex(der) {
    var subj = findSubjectTLV(der);
    if (!subj) return null;
    var raw = der.slice(subj.tagOff, subj.end);
    var h = md5(raw);
    var u32 = ((h[0] | (h[1] << 8) | (h[2] << 16) | (h[3] << 24)) >>> 0);
    var s = u32.toString(16);
    while (s.length < 8) s = '0' + s;
    return s;
  }

  return {
    extractPEMs: extractPEMs,
    pemToDer: pemToDer,
    normalizePEM: normalizePEM,
    bytesToB64: _bytesToB64,
    b64ToBytes: _b64ToBytes,
    subjectHashHex: subjectHashHex,
    findSubjectTLV: findSubjectTLV,
    md5: md5
  };
});
