#!/usr/bin/env node
/**
 * probe.js — verify CertUtils.subjectHashHex against the OpenSSL oracle
 * by brute-forcing canonical-encoding strategies until one matches all
 * certificates. When a unique strategy is found, hard-code it in
 * hashlib.js (CANON_STRATEGY).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const CU = require('../module/webroot/hashlib.js');

const dir = path.join(__dirname, 'certs');
const oracleFile = path.join(__dirname, 'oracle.txt');
const oracle = {};
fs.readFileSync(oracleFile, 'utf8').trim().split('\n').forEach(line => {
  const m = line.match(/^(\S+)\s+([0-9a-f]{8})$/);
  if (m) oracle[m[1]] = m[2];
});
const names = Object.keys(oracle);
if (!names.length) { console.error('oracle empty'); process.exit(1); }

// strategy space
const typeForms = ['der', 'bytes'];
const valueForms = ['value', 'tag+value', 'der'];
const entrySeps  = [null, 0x00];
const rdnSeps    = [null, 0x00];
const framings   = ['flat', 'der'];

let candidates = [];
for (const withType of [true, false])
for (const typeForm of typeForms)
for (const valueForm of valueForms)
for (const entrySep of entrySeps)
for (const rdnSep of rdnSeps)
for (const framing of framings) {
  candidates.push({ withTypeOID: withType, typeForm, valueForm, entrySep, rdnSep, framing });
}
// DER framing variants: tag override or not
for (const tagOverride of [null, 0x0c]) {
  candidates.push({ framing: 'der', withTypeOID: true, typeForm: 'der', valueForm: 'value', entrySep: null, rdnSep: null, tagOverride });
}

// load certs
const ders = {};
for (const n of names) {
  const pem = fs.readFileSync(path.join(dir, n + '.pem'), 'utf8');
  ders[n] = CU.pemToDer(pem);
}

// evaluate
const results = [];
for (const strat of candidates) {
  let ok = 0;
  const fails = [];
  for (const n of names) {
    let h = null;
    try { h = CU.subjectHashHex(ders[n], strat); } catch (e) { h = 'ERR:' + e.message; }
    if (h === oracle[n]) ok++;
    else fails.push(n + ':' + h + '!=' + oracle[n]);
  }
  if (ok > 0) results.push({ strat, ok, total: names.length, fails });
}

results.sort((a, b) => b.ok - a.ok);
if (!results.length) {
  console.log('NO strategy matched even one certificate.');
  // debug dump of first cert
  const n = names[0];
  console.log('--- debug', n, 'expected', oracle[n]);
  const subj = CU.findSubjectTLV(ders[n]);
  console.log('subject TLV found:', !!subj);
  if (!subj) { console.log('cert first bytes:', Buffer.from(ders[n].slice(0, 16)).toString('hex')); process.exit(1); }
  const rdns = CU.parseName(ders[n], subj);
  console.log('rdns:', JSON.stringify(rdns && rdns.map(r => r.map(e => ({
    tag: '0x' + e.valueTLV.tag.toString(16),
    value: Buffer.from(ders[n].slice(e.valueTLV.valueOff, e.valueTLV.end)).toString()
  }))), null, 1));
  const canon = CU.canonicalSubject(ders[n], { withTypeOID: true, typeForm: 'der', valueForm: 'value', entrySep: null, rdnSep: null, framing: 'flat' });
  console.log('canon (flat oid-der+value):', canon && Buffer.from(canon).toString('hex'));
  const h = CU.md5(canon);
  console.log('md5:', Buffer.from(h).toString('hex'));
  process.exit(1);
}
for (const r of results.slice(0, 5)) {
  console.log(`${r.ok}/${r.total}  ${JSON.stringify(r.strat)}`);
  if (r.ok < r.total) console.log('   fails:', r.fails.slice(0, 3).join('  '));
}
