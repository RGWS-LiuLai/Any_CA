# AnyKeybox - module

> **Import CA certificates from any `keybox.xml` into the Android system trust store — with a beautiful, bilingual KernelSU / Magisk / APatch WebUI.**

**English** | [简体中文](./README_ZH.md)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Root-3ddc84.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-63d6a5.svg)]()
[![TEE](https://img.shields.io/badge/Works%20with-TEE%20spoofing%20modules-orange.svg)](#-compatibility-tee-modules)

**Author**: RGWS-LiuLai · [GitHub](https://github.com/RGWS-LiuLai) · [Coolapk 恋勿思](https://www.coolapk.com/u/28676823)
**Project**: https://github.com/RGWS-LiuLai/Anykeybox_module

---

## Table of contents

- [What this module does](#-what-this-module-does)
- [Why it matters: the "unknown root" problem](#-why-it-matters-the-unknown-root-problem)
- [Only an "unknown root" needs this module](#-only-an-unknown-root-needs-this-module)
- [Compatibility: TEE modules](#-compatibility-tee-modules)
- [What this module canNOT do](#-what-this-module-cannot-do)
- [How it works](#-how-it-works)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Verifying that it actually worked](#-verifying-that-it-actually-worked)
- [APEX vs traditional target](#-apex-vs-traditional-target)
- [File naming: `<hash>.<n>`](#-file-naming-hashn)
- [The WebUI](#-the-webui)
- [Troubleshooting & issue reporting](#-troubleshooting--issue-reporting)
- [Project structure](#-project-structure)
- [FAQ](#-faq)
- [Disclaimer](#-disclaimer)
- [License](#-license)

---

## What this module does

Every Android device that supports hardware key attestation ships a **trust anchor** — the root certificate that the system uses to validate attestation certificate chains. On most devices this anchor is normally Google's hardware attestation root, and the list of *additional* trusted OEM roots is **empty**.

This module lets you **fill that list with your own certificates**. You pick a `keybox.xml`, the module extracts every certificate inside it, and installs them into the Android system trust store using the exact naming convention the system uses internally. After a reboot, the device treats those certificates as **trusted OEM attestation roots**.

Put simply:

> **Without this module** — your spoofer signs a chain whose root nobody trusts (typically a self-signed keybox). The chain is internally valid, but verification fails with *"root certificate is not trusted"* → **unknown root**.
>
> **With this module** — that same root is now in the device's trusted OEM root list. The chain validates locally, and the attestation status changes from *untrusted* to *"trusted by this device"*.

The module does **not** touch your TEE, your keystore, or any certificate store. It only adds files to a directory the system already reads. Everything is mounted by your root manager and **fully reversible**.

---

## Why it matters: the "unknown root" problem

**Bottom line: this module addresses exactly one situation — an "unknown root" — and in practice that almost always means a self-signed keybox.**

**RKP keyboxes do not need it, and it does nothing for them.** Wherever an RKP key comes from (a third party, another device, the internet), its chain terminates at Google's RKP root, and **every Android device already trusts that root by default**. Install this module and the chain verifies; skip it and the chain verifies. **There is no difference whatsoever.**

**The only case that requires this module is a root certificate that is not trusted — an "unknown root".** In practice that means:

- **Self-signed / generated keyboxes** — the overwhelming majority. You (or a tool) created the root; no device anywhere trusts it, so the chain inevitably reports *unknown root*.
- A few non-standard / private CA chains.
- Rare device or ROM variants missing a particular root (non-GMS builds, heavily customized systems with a trimmed trust store, etc.).

In those cases, local attestation verification reports:

- ❌ *"Root certificate is not trusted"*
- ❌ *"Unknown root"* / unknown trust anchor
- ⚠️ Bootloader status and security level may look right, but the whole attestation is distrusted

That is the scenario this module fixes. The only missing ingredient is "the system should trust this root" — and that is a **local list**, not a hardware secret.

Key technical detail, verified on a live device (Android 15, ColorOS):

```text
framework-res.apk → resources.arsc → vendor_required_attestation_certificates
```

This `string-array` exists in AOSP's `framework-res` and, on most devices, is **empty**. Android's `AttestationVerificationManager` uses it as the set of *additional* trusted OEM attestation roots. Any certificate present in that list is accepted as a trust anchor — **without any remote check, and without any cryptographic proof that it was ever issued by a vendor or by Google**.

This module installs certificates into the system trust store using the standard system CA naming scheme (`<subject-hash>.<n>`), which is the same store consultation path the platform uses. The result is that the platform now recognises your certificate as a valid anchor.

---

## Only an "unknown root" needs this module

### RKP keyboxes: not applicable, not needed

**Plainly: this module is meaningless for RKP keyboxes.**

An RKP chain terminates at Google's RKP root, which is **already trusted by default** on your device. Therefore:

- Without this module → the chain verifies ✅
- With this module → the chain still verifies ✅ (you merely added an already-trusted root again)

**The outcome is identical.** RKP keyboxes are not a target scenario for this module.

### The one real scenario: unknown root (mostly self-signed)

The only reason this module exists is to supply a root certificate that **your device does not trust** — the "unknown root" problem.

In practice it almost always comes from a self-signed keybox:

| Case | Is it an "unknown root"? | Does this module fix it? |
|---|---|---|
| **Self-signed / tool-generated keybox** | ✅ Yes — **the overwhelming majority** | ✅ Yes |
| Non-standard / private CA chain | ✅ Yes | ✅ Yes |
| Device or ROM missing a particular root (non-GMS, trimmed store, heavily customized) | ✅ Yes (rare) | ✅ Yes |
| **RKP keybox (any source)** | ❌ No — root already trusted | ❌ Not needed |
| **Genuine Google hardware keybox** | ❌ No — root already trusted | ❌ Not needed |

In one sentence: **if you are not seeing an "unknown root" error, you do not need this module; if you are, it is almost certainly because you are using a self-signed keybox.**

### About self-signed keyboxes

A keybox you generated yourself (OpenSSL, a script, or a "fake keybox" tool) has a root certificate that **no device trusts, including your own**.

- Without this module → guaranteed *unknown root*
- With this module → the device trusts it locally; local validation passes cleanly

This is the module's core purpose.

---

### ⚠️ Google hardware keyboxes — also not needed

If you hold a **genuine, unrevoked Google hardware attestation keybox**:

- **No benefit whatsoever**: the chain already roots at a trusted anchor, so adding it to the OEM list changes nothing — it was never an "unknown root".
- **It cannot help with Google verification**: see [below](#-what-this-module-cannot-do).
- **It adds risk without reward**: genuine leaked keyboxes are widely checked against Google's revocation lists; a locally trusted root does not protect them.

**Rule of thumb:**

| Your keybox | Should you install this module? |
|---|---|
| Self-signed / generated keybox | ✅ **Yes — the core use case** |
| Non-standard / private CA chain (showing unknown-root errors) | ✅ **Yes** |
| Ordinary RKP keybox (any source) | ❌ **No — no effect at all** |
| Genuine Google hardware keybox | ❌ **No — no effect at all** |

---

## Compatibility: TEE modules

This module works **alongside** any TEE/keybox spoofing module, because it operates on the *verification side* (what roots the device trusts) while those modules operate on the *signing side* (what key signs the chain).

> Note: for most keyboxes (including third-party RKP ones) the root is **already trusted**, so pairing is optional — everything verifies either way. This module only makes a difference when the root is genuinely untrusted.

| TEE module | Compatibility | Notes |
|---|---|---|
| **Oh My Keymint** | ✅ Works well | With this module, even a chain whose root is not locally trusted can validate |
| **TEESimulator** | ✅ Works well | Natural pairing: simulator signs, AnyKeybox makes the root trusted |
| **TEESimulator-RS** | ✅ Works well | Same as above |
| **Tricky Store OSS** | ✅ Works well | |
| **Tricky Store** | ✅ Works well | |
| Other keybox/TEE spoofing modules | ✅ Generally works | As long as the module injects a keybox whose root is not already trusted |

> **Recommended combination** (when the root is genuinely untrusted): `TEE module` + `AnyKeybox - module`
> The TEE module provides the key and signs the chain; AnyKeybox makes the device trust that chain's root — yielding a chain that is *internally valid **and** locally trusted*.

### About burning keys into hardware (烧录) — theoretical only, not recommended

Some advanced users ask about *burning* keys into a device (e.g. provisioning a keybox into secure hardware). Theoretically this can produce a key that is genuinely hardware-backed, and this module would then be compatible with it. **In practice it is not recommended:**

- Burning is risky, irreversible, and highly device-specific.
- It does not solve the "unknown root" problem by itself — a burned key whose root nobody trusts is still an unknown root. (Which is precisely what this module is for; but the burning adds far more risk than the root-trust fix removes.)
- The overwhelming majority of users do not need it. **Use a TEE module + this module instead.**

---

## What this module canNOT do

Being explicit matters more than being encouraging:

### ❌ It does not help you pass Google certification / Play Integrity

This module makes your **device** trust a root certificate **locally**. It does **not** make **Google's servers** trust anything:

- Google's attestation verification (Play Integrity `MEETS_STRONG_INTEGRITY`, etc.) validates the chain **server-side, against Google's own trust store**.
- Google never looks at `vendor_required_attestation_certificates` on your device.
- A self-signed or RKP keybox will still fail Google's server-side verification, no matter what your device trusts locally.

**Whether you pass Google verification depends entirely on whether your keybox is genuine and unrevoked — not on this module.** If your keybox is fake, self-signed, or another device's RKP keybox, Google will reject it regardless. This module is about *local consistency*, not *server-side certification*.

### ❌ It is not a keybox generator

It does not create keys, does not forge attestation chains, and does not modify your TEE. It only installs the certificates you give it.

### ❌ It does not bypass hardware-backed verification server-side

Any app that talks to a remote server which requires a Google-signed chain will see the truth. There is no local trick for that.

---

## How it works

```text
┌──────────────────┐
│   keybox.xml     │  (any XML containing PEM certificates)
└────────┬─────────┘
         │  WebUI: extract every PEM block
         ▼
┌──────────────────────────────────────────────┐
│ dedupe by DER → compute name                 │
│   name = MD5(Subject DER TLV) → <hash>.<n>   │  ← Android system CA naming
└────────┬─────────────────────────────────────┘
         │
         ▼
 /data/adb/modules/AnyKeybox_module/
   ├── apex/com.android.conscrypt/cacerts/<hash>.<n>      (preferred)
   ├── system/etc/security/cacerts/<hash>.<n>             (fallback)
   └── state.txt                                          (tracked files)
         │
         │  your root manager (KernelSU / Magisk / APatch)
         ▼  magic-mounts these files into the real trust store
 /apex/com.android.conscrypt/cacerts/<hash>.<n>
         │
         │  Android's TrustedCertificateStore looks up by
         ▼  "<subject-hash>.<n>" and finds YOUR certificate
 ✅ device trusts the root → local attestation chain validates
```

The status engine then walks a five-step verification per certificate (`source file → mounted → DER identical → visible to Zygote → visible to app`) and reports the truth in the WebUI, including whether a reboot has happened since import.

---

## Features

- **Bilingual UI (EN / 中文)** — auto-detected from the system language, with a manual toggle (the manual choice is remembered and disables auto-detection)
- **Auto dark / light theme** — follows the system, manual toggle in the top-right corner
- **One-tap import** — system file picker for any `.xml`; manual path input as a fallback
- **Complete extraction** — every PEM block, deduplicated; zero certificates ⇒ explicit error
- **Correct naming** — `<subject-hash>.<n>`, verified **149 / 149** against a live device's system CA store; collisions increment `n` from 0
- **Spec-compliant files** — PEM, `root:root`, `0644`, SELinux `u:object_r:system_file:s0`
- **Dual-target detection** — prefers the APEX conscrypt store, falls back to `/system/etc/security/cacerts`, errors out if neither exists
- **Real status, not guesses** — per-certificate five-step verification, reboot detection
- **Issue-report nudge** — if verification still fails *after a reboot*, the UI offers a one-tap link to GitHub Issues (at most once per boot)
- **Fully reversible** — re-picking replaces the previous certificates; uninstalling removes everything
- **Live `module.prop` description** — ✅ when mounted and trusted, ⏳ when imported but pending

---

## Installation

**Requirements:** Android with root (KernelSU / Magisk / APatch), and a root manager that supports module WebUI.

1. Download `AnyKeybox_module-v1.0.0.zip`.
2. Install it in your root manager (KernelSU → Modules → Install from storage; Magisk similarly).
3. Open the module's **WebUI** (KernelSU shows an "Open" / WebUI button next to the module).
4. Pick your `keybox.xml` (or any XML containing certificates).
5. Enable the module, then **reboot** (see [APEX vs traditional](#-apex-vs-traditional-target)).
6. Re-open the WebUI → the status card should read ✅ **Certificates mounted & trusted**.

---

## Usage

The WebUI is the whole interface:

| Element | What it does |
|---|---|
| **Status card** (top) | Real state of your certificates: not imported / imported but not active / mounted & trusted / **problem after reboot** |
| **Big pick button** (center) | Opens the system file picker for any XML file |
| **Manual path** link | Enter a file path instead of using the picker |
| **Theme button** (top-right, moon/sun) | Toggle dark/light; the manual choice is remembered |
| **Language button** (top-right, EN/中) | Toggle language; the manual choice is remembered |
| **About button** (top-right, ⓘ) | Author links + license |
| **Next steps card** | Context-aware guidance (reboot required / hot reload acceptable / all done) |

Re-picking a file **replaces** the previously imported certificates — the old CA files are deleted, the new ones are written. The pick button stays available even after a successful mount, on purpose.

---

## Verifying that it actually worked

"Files exist in the path" is not the same as "the system trusts them". Do a real check:

### Option A — built-in WebUI status (recommended)

The status card performs a five-step check per certificate:

| Step | Meaning |
|---|---|
| **Source** | The module's own copy exists |
| **Mount** | Your root manager mounted it into the real system store |
| **Content** | DER fingerprint identical to what you imported |
| **Zygote** | Visible inside *every* Zygote process's mount namespace |
| **App** | Visible inside a running app process |

All green ⇒ the chain will validate locally.

### Option B — standalone shell script (included in the repo)

`verify.sh` (at the repository root, **not** inside the module ZIP) performs the same checks from a terminal:

```bash
su -c 'sh /path/to/verify.sh'
# or point it at the installed module directory:
su -c 'sh /path/to/verify.sh /data/adb/modules/AnyKeybox_module'
```

Exit codes: `0` = all passed, `1` = something failed, `2` = nothing imported yet.

### Option C — KeyAttestation app

After rebooting, open a KeyAttestation-style app. The relevant line stops saying *"root certificate is not trusted"* and instead reads along the lines of *"the root certificate is trusted by this device, but may not be trusted by others"*. **That is exactly the state this module aims for** — locally trusted, not globally certified.

> If it still fails **after a reboot**, open the WebUI: it shows which specific step failed per certificate, and offers a one-tap link to report the issue on GitHub.

---

## APEX vs traditional target

The module auto-detects which trust store your Android uses and prefers the modern one:

| Target | Path | Activation |
|---|---|---|
| **APEX (preferred)** | `/apex/com.android.conscrypt/cacerts/` | **Reboot is required.** The root manager injects the certificates into the Zygote mount namespace at boot; hot reload is usually not enough for already-running apps. |
| **System (fallback)** | `/system/etc/security/cacerts/` | **Reboot or hot reload** both work (NoMount-style managers can hot-reload). |

If neither directory exists, the import aborts with an explicit error.

> Note: even in the traditional case, hot reload only affects *new* processes. Running apps keep the trust store they built at startup. If an app still doesn't trust the certificate, reboot.

---

## File naming: `<hash>.<n>`

Android's system CA store is indexed by **`<subject-hash>.<n>`**:

- `<subject-hash>` is the uppercase-lowercase 8-hex-digit hash of the certificate's **Subject**,
- `.n` disambiguates *different certificates that share the same subject* — `n` starts at 0 and increments.

The hash used by Android (BoringSSL) is:

```text
hash = first 4 bytes of MD5( raw DER encoding of the Subject Name TLV ), little-endian
```

This was not assumed — it was **reverse-engineered and verified against a real device**: all **149 / 149** certificates in `/apex/com.android.conscrypt/cacerts/` on the test device hashed to their own filenames. Note that this is *not* the same as modern OpenSSL's `openssl x509 -subject_hash` (which uses SHA-1 over a canonicalized name); using that would silently produce wrong filenames.

If your certificate's subject collides with one already present (in the system store or previously imported), `n` is incremented automatically — so multiple keyboxes with the same subject never overwrite each other.

---

## The WebUI

A Material-3-inspired interface, deliberately close to the familiar look of modern root-module UIs:

- **Auto language**: Chinese system locale → 中文; anything else → English. Manual toggle persists.
- **Auto theme**: follows the system dark/light setting. Manual toggle persists.
- **Status truthfulness**: it re-checks on every open — it never assumes that a previous success still holds.
- **Honest failure**: a red "problem" state with a per-certificate matrix, plus a one-tap GitHub Issues link (only offered if the failure persists **after a reboot**).

---

## Troubleshooting & issue reporting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Imported — not yet active" | Module not mounted yet, or not rebooted | Enable the module and reboot |
| Status stays ⏳ after reboot | Root manager didn't mount `product/overlay`-style paths / module disabled | Check the module is **enabled** and not "update pending"; reinstall and reboot |
| Mount ✅ but Zygote ❌ | Hot-reloaded only; Zygote namespace not injected | **Reboot** |
| "No certificate found in that file" | The XML has no PEM blocks, or certificates are stored differently | Check that the file contains `-----BEGIN CERTIFICATE-----` |
| "No certificate directory found" | Unusual Android build | The device has neither APEX nor system cacerts — not supported |
| KeyAttestation still says *unknown root* | TEE module not installed / not signing with this keybox | **Pair AnyKeybox with a TEE module** — this module only fixes the trust side |
| Play Integrity still fails | Google verifies server-side | Expected; depends on whether your keybox is genuine — see [limitations](#-what-this-module-cannot-do) |

**Reporting issues**: if verification fails **after a reboot**, the WebUI offers a direct link to
https://github.com/RGWS-LiuLai/Anykeybox_module/issues.
Please include the status card screenshot — it lists exactly which check failed for which file.

---

## Project structure

```text
AnyKeybox_module/
├── README.md                     ← English (this file)
├── README_ZH.md                  ← 简体中文
├── LICENSE                       ← AGPL-3.0
├── build.sh                      ← packaging script → release/*.zip
├── verify.sh                     ← standalone verification tool (not shipped in the ZIP)
├── module/                       ← contents of the flashable ZIP
│   ├── module.prop               ← id / name / version / live description
│   ├── customize.sh              ← installer
│   ├── service.sh                ← refreshes status on boot
│   ├── uninstall.sh
│   ├── scripts/
│   │   └── status.sh             ← state detection + per-cert verification
│   └── webroot/
│       ├── index.html            ← WebUI
│       ├── style.css             ← theme (auto + manual dark/light)
│       ├── hashlib.js            ← DER / MD5 / Android naming hash (zero deps)
│       └── index.js              ← i18n, import flow, status matrix, reporting
└── devtest/                      ← hash-verification harness (dev only)
```

---

## FAQ

**Q: Does this make my keybox pass Play Integrity?**
No. It makes *your device* trust the root locally. Google verifies server-side. Whether you pass depends on your keybox being genuine and unrevoked.

**Q: I have a genuine Google hardware keybox — should I install this?**
No. Your chain already roots at a trusted anchor; this module adds nothing and cannot help with Google-side checks.

**Q: Why do I also need a TEE module?**
They do different jobs: a TEE module handles the *signing* side (it actually signs with that keybox), while this module handles the *trust* side (making the root trusted by the device). You only need this module when an *unknown root* occurs.

**Q: Do I need this for an RKP keybox?**
**No — it has no effect at all.** An RKP chain terminates at Google's RKP root, which your device already trusts, so installing it changes nothing. This module exists solely for the *unknown root* case, which in practice almost always means a **self-signed** keybox.

**Q: Will re-picking a file stack up duplicates?**
No. Each import removes the previously imported CA files first.

**Q: Is it reversible?**
Yes. Disabling/uninstalling the module removes the mounts and the files; reboot restores the original state. Note: **updating** the module resets its directory, so re-pick your keybox afterwards.

**Q: Does it modify system partitions?**
No. Everything lives under `/data/adb/modules/AnyKeybox_module/` and is mounted at boot by your root manager.

**Q: Which Android versions?**
Android 10+ in practice; the APEX conscrypt store is Android 14+. On older devices the traditional `/system/etc/security/cacerts` path is used.

---

## Disclaimer

For **personal study and security research only**. Do not use this project for any illegal purpose, including but not limited to bypassing financial/payment attestation, forging identity, or violating others' privacy. You are solely responsible for any legal consequences of your use. The author is not liable for any misuse.

This module does not create, forge, or leak any key. It only installs certificates **you provide** into a local trust list.

---

## License

**GPL-3.0** — this project is open source; **closed-source use is forbidden**. See [LICENSE](./LICENSE).

Author: **RGWS-LiuLai** · Coolapk: **恋勿思** · https://github.com/RGWS-LiuLai/Anykeybox_module
