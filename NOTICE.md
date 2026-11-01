# NOTICE — Third-Party Components and Attributions

**Any - CA** (package: `Any_CA`)
Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思)
Licensed under the **GNU General Public License v3.0** (see `LICENSE`).

This project is developed and owned in full by its author. It is the same
project previously published as *AnyKeybox - module* at
https://github.com/RGWS-LiuLai/AnyKeybox_module — that name has been retired and
replaced by **Any - CA**. It is **not** a derivative of a third party, and no
third-party project is thanked for anything the author wrote.

---

## 1. AOSPGenKeyBox

- **License**: **GNU General Public License v3.0**
- **Used for**: reference for the Android Keystore attestation `KeyDescription`
  ASN.1 layout (OID `1.3.6.1.4.1.11129.2.1.17`) and the three-level CA
  hierarchy, during development of a keybox generation feature.
- **Usage mode**: **No code is shipped.** The generation feature that relied on
  this reference was removed in 2.0.0 (see CHANGELOG) because a self-signed
  keybox cannot pass any Google certification.
- Only the structural knowledge was used; the implementation was independent
  JavaScript, and it is no longer part of the project.

> Upstream marks its output as **TEST ONLY** and states that generated keyboxes
> fail Google Play Integrity validation.

---

## 2. miuix (Compose Multiplatform UI library)

- **Upstream**: https://github.com/compose-miuix-ui/miuix
- **License**: **Apache License 2.0** (full text: `licenses/Apache-2.0.txt`)
- **Used for**: **visual design language reference only** — component shapes,
  corner radii, spacing scale, motion feel, colour-role semantics.
- **Usage mode**: **No source code is copied.** miuix is a Kotlin / Compose
  Multiplatform library; this project's UI runs in an Android WebView using
  HTML/CSS/JavaScript. The interface is an independent CSS implementation
  inspired by the design language.
- **License compatibility**: Apache-2.0 is compatible with GPL-3.0
  (one-directional). No code is copied, so no obligation beyond attribution,
  which is provided here.

---

## 3. KernelSU / Magisk / APatch module conventions

- KernelSU: GPL-3.0 — module format, `module.prop`, `customize.sh`, `webroot`
  WebUI conventions, `post-fs-data.sh` execution stage, `skip_mount`.
- Magisk: GPL-3.0 — module format conventions.
- APatch: see upstream.
- **Usage mode**: follows the documented module/WebUI conventions only. No
  source code copied.

---

## 4. Runtime dependencies

**None.** The shipped module contains only:

- POSIX shell scripts (run by the system shell / busybox),
- HTML / CSS / JavaScript executed in the WebView,
- No compiled binaries, no Python, no OpenSSL executable, no npm packages.

The CA file-name hash uses a pure-JavaScript MD5 implementation.

---

## 5. License summary

| Component | License | Code copied? | Obligation |
|---|---|---|---|
| Any - CA (this project) | GPL-3.0 | — | Full GPL-3.0 |
| AOSPGenKeyBox | GPL-3.0 | **No** (design reference only) | Attribution |
| miuix | Apache-2.0 | **No** | Attribution only |

This project as a whole is distributed under **GPL-3.0**. Closed-source
redistribution is not permitted.

---

*Last updated: 2026 — maintained by RGWS-LiuLai.*
