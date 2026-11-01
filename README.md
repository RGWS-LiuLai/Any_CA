# Any - CA

> **Import CA certificates into the Android system trust store — from a bilingual module WebUI.**

**English** | [简体中文](./README_ZH.md)

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Root-3ddc84.svg)]()
[![Version](https://img.shields.io/badge/version-2.0.0-63d6a5.svg)]()

**Author**: RGWS-LiuLai · [GitHub](https://github.com/RGWS-LiuLai) · [Coolapk 恋勿思](https://www.coolapk.com/u/28676823)
**Project**: https://github.com/RGWS-LiuLai/Any_CA
**Package**: `Any_CA` · **Version**: 2.0.0 (versionCode 2)

---

## What this module does

**One job:** take a CA certificate and make the Android system trust it.

Pick a PEM / DER / X.509 file from the WebUI — it may hold a single
certificate or a whole bundle — and the module installs every certificate it
finds into the system CA store, so all apps trust them for TLS.

Nothing else. No keybox generation, no attestation spoofing.

---

## Why it works

Android's `TrustedCertificateStore` **enumerates the CA directory at runtime**,
when a process first validates a certificate chain. Unlike services that scan
once at boot, this means a file that exists in the directory is picked up by
every process started afterwards.

```
post-fs-data.sh  (runs before system_server)
   → builds a directory: stock certs + your staged certs
   → bind-mounts it over /apex/com.android.conscrypt/cacerts
        ↓
any process started later lists that directory
   → finds <subject-hash>.<n>
   → trusts it
```

File names follow the real Android convention:

```
name = MD5(raw Subject DER), first 4 bytes, little-endian  →  <hash>.<n>
```

Verified against **149 / 149** certificates in a live device's
`/apex/com.android.conscrypt/cacerts/`.

---

## What this module removed in 2.0.0

### Keybox generation — removed

A self-signed keybox cannot pass any Google certification, so generating one has
no practical value.

### Keybox distribution to TEE modules — removed

Installing a `keybox.xml` into Oh My Keymint / Tricky Store / TEESimulator worked
technically, but it only matters for attestation spoofing, which this module no
longer covers. Keeping it would have implied the module helps pass attestation,
which it does not.

### OEM attestation overlay (RRO) — attempted, impossible

The goal was to make KeyAttestation report *"trusted by this device"* by
overriding the framework array
`array/vendor_required_attestation_certificates` with a static RRO.

**This cannot work on modern Android:**

- `framework-res.apk` ships **no `overlayable.xml`**, so no third-party overlay
  is permitted to override framework resources.
- OverlayManagerService accepts only overlays signed like the target, or ones
  pre-installed in the system image.
- Even when the APK was bind-mounted into `/product/overlay` **before**
  `PackageManager` scanned it — and `PackageManager` did parse it successfully —
  registration was refused:
  `the overlay lacks <overlay android:targetName>`.
  There is no value to supply, because the target package declares no
  overlayable group.

Verified on Android 16 / ColorOS. The attempt is preserved in
[CHANGELOG.md](./CHANGELOG.md).

---

## Features

- **Import one or many CA certificates** — a single file may hold multiple PEM
  blocks; duplicates are skipped, each certificate becomes its own list item.
- **Live status** — the card shows green / yellow / red plus total and active
  counts. "Active" means the staged `<hash>.<n>` really appears in the live
  system store, verified rather than assumed.
- **Item list** — enable/disable, delete (with confirmation), pin to top.
- **74 languages** — auto-detected from the system, manual override persisted.
- **Dark / light theme** — follows the system, manual override persisted.
- **Data survives updates** — `customize.sh` stages and restores `data/`.

---

## Mounting

The module **does its own mounting** in `post-fs-data.sh` and ships
`skip_mount` so meta-modules stay out of the way.

Why not leave it to the root manager: meta-modules built on **VFS path
redirection** (NoMount and similar) are invisible to directory enumeration. The
CA store is read with `readdir`, so those redirects never work for it — a real
bind mount is required.

| Content | Staged in module | Mounted onto |
|---|---|---|
| CA certificates | `data/apex/com.android.conscrypt/cacerts/` | `/apex/com.android.conscrypt/cacerts` |

The bind mount merges stock certificates with the staged ones, so nothing is
lost.

Two failure modes are explicitly guarded against, both learned the hard way:

- `post-fs-data.sh` never deletes a directory that is currently bind-mounted —
  doing so yields a `/deleted` mount and an empty tree.
- Staging verifies each written file is non-empty; writing in place over a live
  bind mount can silently produce a 0-byte file.

---

## Status colours

| Colour | Meaning |
|---|---|
| 🟢 Green | At least one item enabled, and every enabled item is active |
| 🟡 Yellow | Some enabled items active |
| 🔴 Red | Nothing enabled, or no enabled item active |

---

## Installation

1. Flash `Any_CA-v2.0.0.zip` in KernelSU / Magisk / APatch.
2. Open the module **WebUI**.
3. Import a CA certificate.
4. Enable the module and **reboot** — needed so the bind mount reaches every
   process, including those already running.

---

## Project structure

```text
Any-CA/
├── README.md / README_ZH.md
├── CHANGELOG.md
├── LICENSE                     GPL-3.0
├── NOTICE.md                   third-party attributions
├── update.json
├── build.sh
├── verify.sh
└── module/
    ├── module.prop
    ├── customize.sh
    ├── service.sh
    ├── uninstall.sh
    ├── post-fs-data.sh         ★ performs the CA bind mount
    ├── skip_mount              ★ tells meta-modules to skip this module
    ├── scripts/
    │   ├── common.sh           paths & helpers
    │   ├── trust.sh            CA staging (dedup, rollback, verification)
    │   ├── list.sh             list operations
    │   └── status.sh           colour + counters
    └── webroot/
        ├── index.html
        ├── style.css / miuix.css
        ├── app.js              status, list, modals
        ├── app2.js             CA import, language, about
        ├── hashlib.js          PEM/DER parsing + Android CA naming hash
        └── i18n*.js            74-language registry
```

---

## Risks

> **System CA trust and root operations are risky. Use only on devices you own,
> and back up your data first.**

- This module modifies the **system trust store**. A malformed anchor can break
  TLS validation for apps.
- Everything is reversible: uninstalling and rebooting restores the stock state.

---

## Licence

**GPL-3.0** — open source; **closed-source redistribution is forbidden**.
See [LICENSE](./LICENSE) and [NOTICE.md](./NOTICE.md).

---

## Acknowledgements

- **miuix** (Apache-2.0) — UI design language reference. miuix is a
  Kotlin/Compose library, so **no source code is used**; the interface is an
  independent CSS interpretation.
- **AOSPGenKeyBox** (GPL-3.0) — reference for the Android Keystore
  `KeyDescription` ASN.1 layout during development of the keybox generation
  feature. **No code is shipped**, and that feature was removed in 2.0.0.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
