#!/usr/bin/env node
/**
 * brute.js — crack the OpenSSL canonical-encoding (canon_enc) rule
 * against the modern CLI -subject_hash oracle (SHA-256 based; the
 * canonicalization rule itself is identical across digest versions).
 */
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const CU = require('../module/webroot/hashlib.js');

const h32 = (bytes) => {
  const h = crypto.createHash('sha256').update(Buffer.from(bytes)).digest();
  return ((h[0] | (h[1] << 8) | (h[2] << 16) | (h[3] << 24)) >>> 0).toString(16).padStart(8, '0');
};

// ---------- load oracle (modern CLI) ----------
const certs = fs.readdirSync(path.join(__dirname, 'certs')).filter(f => f.endsWith('.pem'));
const oracle = {};
for (const f of certs) {
  const { execFileSync } = require('child_process');
  const h = execFileSync('openssl', ['x509', '-in', path.join(__dirname, 'certs', f), '-noout', '-subject_hash']).toString().trim();
  oracle[f.replace('.pem', '')] = h;
}
// add real-device AOSP certs (filename is the OLD MD5 oracle — handled later)
console.log('oracle loaded:', Object.keys(oracle).join(' '));

// ---------- build candidate canon_enc ----------
function parseRDNs(der) {
  const subj = CU.findSubjectTLV(der);
  if (!subj) return null;
  return CU.parseName(der, subj);
}
const D = (n) => derOf => derOf; // helper no-op

function buildCandidates(der, name) {
  const rdns = parseRDNs(der);
  if (!rdns) throw new Error('parse fail ' + name);
  const cands = {};
  const flat = (entrySep, rdnSep, withType, typeForm, valForm) => {
    const out = [];
    rdns.forEach((rdn, ri) => {
      if (ri > 0 && rdnSep != null) out.push(rdnSep);
      rdn.forEach((e, ai) => {
        if (ai > 0 && entrySep != null) out.push(entrySep);
        if (withType === 'der') out.push(...der.slice(e.typeTLV.valueOff - 2, e.typeTLV.end));
        else if (withType === 'bytes') out.push(...der.slice(e.typeTLV.valueOff, e.typeTLV.end));
        const canon = CU.canonStringBytes(e.valueTLV.tag, der.slice(e.valueTLV.valueOff, e.valueTLV.end));
        if (valForm === 'value') out.push(...canon);
        else if (valForm === 'tag+value') out.push(e.valueTLV.tag, ...canon);
        else if (valForm === 'tlv') {
          out.push(e.valueTLV.tag, canon.length & 0xff, ...canon);
        } else if (valForm === 'raw') out.push(...der.slice(e.valueTLV.valueOff, e.valueTLV.end));
      });
    });
    return out;
  };
  // flat combos
  for (const entrySep of [null, 0x00, 0x20, 0x2b, 0x0a])
    for (const rdnSep of [null, 0x00, 0x20, 0x2b, 0x0a])
      for (const withType of [null, 'der', 'bytes'])
        for (const valForm of ['value', 'tag+value', 'tlv', 'raw']) {
          if (withType === null && valForm === 'raw') continue;
          const key = `flat es=${entrySep} rs=${rdnSep} t=${withType} v=${valForm}`;
          cands[key] = flat(entrySep, rdnSep, withType, null, valForm);
        }
  // der-framed combos: re-encode Name with canonical values
  const encLen = (l) => l < 0x80 ? [l] : l < 0x100 ? [0x81, l] : l < 0x10000 ? [0x82, l >> 8, l & 255] : [0x83, l >> 16, (l >> 8) & 255, l & 255];
  function derFrame(opt) {
    const rdnsOut = [];
    for (const rdn of rdns) {
      const atvs = [];
      for (const e of rdn) {
        const canon = CU.canonStringBytes(e.valueTLV.tag, der.slice(e.valueTLV.valueOff, e.typeTLV.end === e.typeTLV.end ? e.valueTLV.end : e.valueTLV.end));
        let vtag = opt.tagOverride != null ? opt.tagOverride : e.valueTLV.tag;
        if (opt.tagDrop) { // value as raw bytes, no tag/len
          atvs.push([0x30, ...encLen((e.typeTLV.end - e.typeTLV.valueOff + 2) + canon.length), ...der.slice(e.typeTLV.valueOff - 2, e.typeTLV.end), ...canon]);
          continue;
        }
        atvs.push([0x30, ...encLen((e.typeTLV.end - e.typeTLV.valueOff + 2) + 1 + encLen(canon.length).length + canon.length), ...der.slice(e.typeTLV.valueOff - 2, e.typeTLV.end), vtag, ...encLen(canon.length), ...canon]);
      }
      const setBody = atvs.flat();
      rdnsOut.push([0x31, ...encLen(setBody.length), ...setBody]);
    }
    const nameBody = rdnsOut.flat();
    return [0x30, ...encLen(nameBody.length), ...nameBody];
  }
  cands['derframe tag保留'] = derFrame({});
  cands['derframe tag统一utf8'] = derFrame({ tagOverride: 0x0c });
  cands['derframe 值无tag'] = derFrame({ tagDrop: true });
  // no-outer-Name-header variants
  for (const k of Object.keys(cands)) {
    if (k.startsWith('derframe')) cands[k + ' 无Name头'] = cands[k].slice(2);
  }
  // value-only hash (no type info at all)
  cands['仅值扁平'] = flat(null, null, null, null, 'value');
  return cands;
}

// ---------- test each candidate rule on ALL certs ----------
const ruleHits = {}; // rule -> {hit: count, total}
let firstName = null;
for (const name of Object.keys(oracle)) {
  const f = path.join(__dirname, 'certs', name + '.pem');
  if (!fs.existsSync(f)) continue;
  const der = CU.pemToDer(fs.readFileSync(f, 'utf8'));
  let cands;
  try { cands = buildCandidates(der, name); } catch (e) { console.error(name, e.message); continue; }
  if (!firstName) { firstName = name; }
  for (const [rule, bytes] of Object.entries(cands)) {
    const got = h32(bytes);
    ruleHits[rule] = ruleHits[rule] || { hit: 0, total: 0 };
    ruleHits[rule].total++;
    if (got === oracle[name]) ruleHits[rule].hit++;
  }
}
const ranked = Object.entries(ruleHits).sort((a, b) => b[1].hit - a[1].hit).slice(0, 8);
console.log('=== top rules (sha256 oracle) ===');
for (const [rule, { hit, total }] of ranked) console.log(`${hit}/${total}  ${rule}`);
