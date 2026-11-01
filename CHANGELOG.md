# Changelog

## 1.0.0 (versionCode 1)

First release of **Any - CA**.

This project is the successor of
[AnyKeybox_module](https://github.com/RGWS-LiuLai/AnyKeybox_module) — same
project, earlier name. Its feature set was rebuilt from scratch around a single
goal that actually works.

### What it does

Import CA certificates into the Android **system trust store**. Pick a
PEM / DER / X.509 file in the WebUI — a single certificate or a whole bundle —
and every certificate it contains is installed, so all apps trust them for TLS.

### Added

- **Bilingual WebUI** (74 languages, auto-detected with persisted manual
  override) inspired by the miuix design language — an independent CSS
  implementation, not a copy of miuix source.
- **Multi-certificate import** — one file may hold many PEM blocks; duplicates
  are skipped and each certificate becomes its own list item.
- **Live verification** — the status card reports per-certificate checks and
  shows green / yellow / red with total and active counts. "Active" means the
  staged `<hash>.<n>` really appears in the running system store.
- **Correct Android naming** — `MD5(Subject DER)` first 4 bytes, little-endian,
  written as `<hash>.<n>`. Verified against **149 / 149** certificates in a live
  device's `/apex/com.android.conscrypt/cacerts/`.
- **Item list** — enable/disable, delete (confirmed), pin to top.
- **Data preserved across module updates** — `customize.sh` stages and restores
  `data/`.

### Mounting

The module performs its own mounting in `post-fs-data.sh` and ships
`skip_mount`.

Meta-modules built on **VFS path redirection** (NoMount and similar) are
invisible to directory enumeration. The CA store is read with `readdir`, so
those redirects never work for it — a real bind mount is required.

Two failure modes are explicitly guarded against:

- `post-fs-data.sh` never deletes a directory that is currently bind-mounted —
  doing so yields a `/deleted` mount and an empty tree, which breaks every app
  that depends on the affected system directory.
- Staging verifies each written file is non-empty; writing in place over a live
  bind mount can silently produce a 0-byte file.

### Not included

**Keybox generation.** A self-signed keybox cannot pass any Google
certification, so generating one has no practical value. The generation engine
from the predecessor project (ASN.1 encoder, X.509 builder, `KeyDescription`,
subject templates, keybox assembler) was not carried over.

**Keybox distribution to TEE modules.** Installing a `keybox.xml` into
Oh My Keymint / Tricky Store / TEESimulator worked technically, but it only
matters for attestation spoofing, which this module does not cover. Keeping it
would have implied the module helps pass attestation, which it does not.

**OEM attestation RRO overlay.** The goal was to make KeyAttestation report
*"trusted by this device"* by overriding the framework array
`array/vendor_required_attestation_certificates` with a static RRO.

**This cannot work on modern Android**, verified on Android 16 / ColorOS:

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

### Verified

- The Android CA naming hash matched **149 / 149** certificates in a live
  device's system CA store.
- A staged CA appears in the live store with a matching `<hash>.<n>` name and is
  visible to newly started Zygote processes.
- Multi-certificate import: a 4-certificate bundle imported as 4 separate items,
  with duplicates correctly skipped.
