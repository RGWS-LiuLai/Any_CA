# Changelog

## 2.0.0 (versionCode 2)

This is a major update of the same project, renamed from **AnyKeybox - module**
to **Any - CA**. The old repository name has been retired.

### Added

- **Bilingual WebUI** (74 languages, auto-detected with persisted manual
  override) inspired by the miuix design language — an independent CSS
  implementation, not a copy of miuix source.
- **Automatic TEE module detection** with precise `module.prop` matching:
  - Oh My Keymint → `/data/misc/keystore/omk/keybox.xml`
  - Tricky Store / Tricky Store OSS / TEESimulator ≤3.2 / TEESimulator-RS →
    `/data/adb/tricky_store/keybox.xml`
  - TEESimulator ≥4.0 → `/data/adb/teesim/keybox.xml`
- **Multi-certificate CA import** — one file may contain many PEM blocks; each
  becomes its own list item with automatic de-duplication.
- **Keybox backup and restore** — every overwrite backs up the previous file;
  `uninstall.sh` restores it.
- **Global device-spoofing detection** — reads `common/system.prop` overrides of
  `ro.product.brand/manufacturer/model`. Per-app Zygisk spoofing is ignored.
- **Item list** — enable/disable, delete (confirmed), pin.
- **Status card** — green/yellow/red with live total and active counters.
- **Data preserved across module updates**.

### Changed

- **The module now performs its own mounting** in `post-fs-data.sh` and ships
  `skip_mount`. Meta-modules based on VFS path redirection (NoMount and similar)
  are invisible to `readdir`, and the CA store is read by directory enumeration,
  so a real bind mount is required.
- Certificate type detection is structural, not name-based.

### Removed — keybox generation

The generation engine (ASN.1 encoder, X.509 builder, `KeyDescription`, subject
templates, keybox assembler — about 1,600 lines of JavaScript) was deleted.
A self-signed keybox cannot pass any Google certification, so generating one has
no practical value.

### Removed — OEM attestation overlay (failed approach)

A static RRO overriding `array/vendor_required_attestation_certificates` was
implemented and tested. **It does not work on modern Android:**

- `framework-res.apk` ships **no `overlayable.xml`**, so third-party overlays may
  not override framework resources.
- OverlayManagerService only accepts overlays signed like the target, or
  pre-installed ones baked into the system image.
- Even with the file bind-mounted before boot and `PackageManager` successfully
  parsing it, registration is refused:
  `the overlay lacks <overlay android:targetName>` — and there is no
  `targetName` value to supply, because the target declares no overlayable group.

Verified on a live Android 16 / ColorOS device. The removed pieces were:
`gen/overlay.js`, `gen/apksign.js`, `scripts/overlay.sh`, plus the related UI.

### Fixed

- `post-fs-data.sh` no longer deletes a directory that is currently
  bind-mounted; doing so produced a `/deleted` mount and an empty tree.
- CA staging now verifies the written file is non-empty, catching the case where
  an in-place write over a live bind mount silently produced a 0-byte file.
- Stale TEE directories (left over from uninstalled modules) are no longer
  reported as installed modules.

### Verified

- The Android CA naming hash was validated against **149 / 149** certificates in
  a live device's `/apex/com.android.conscrypt/cacerts/`.
- A staged CA appears in the live store with a matching `<hash>.<n>` name and is
  visible to newly started Zygote processes.

---

## 1.0.0 (versionCode 1) — as *AnyKeybox - module*

- Import CA certificates from any `keybox.xml` into the system trust store.
- APEX-preferred trust store targeting with legacy fallback.
- Five-step mount verification and reboot detection.
- Bilingual (English / Chinese) UI with dark and light themes.
