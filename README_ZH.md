# Any - CA

> **把 CA 证书装进 Android 系统信任库——一个双语模块 WebUI 搞定。**

[English](./README.md) | **简体中文**

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Root-3ddc84.svg)]()
[![Version](https://img.shields.io/badge/version-2.0.0-63d6a5.svg)]()

**作者**：RGWS-LiuLai · [GitHub](https://github.com/RGWS-LiuLai) · [酷安 恋勿思](https://www.coolapk.com/u/28676823)
**项目地址**：https://github.com/RGWS-LiuLai/Any_CA
**包名**：`Any_CA` · **版本**：2.0.0 (versionCode 2)

---

## 这个模块做什么

**只做一件事：** 拿一张 CA 证书，让 Android 系统信任它。

在 WebUI 里选一个 PEM / DER / X.509 文件——单张证书或整个证书包都行——
模块会把其中每一张证书装进系统 CA 库，所有应用的 TLS 都会信任它们。

没有别的。不生成 keybox，不做认证伪装。

---

## 为什么可行

Android 的 `TrustedCertificateStore` 在进程首次校验证书链时，**运行时枚举 CA 目录**。
这和「开机只扫一次」的服务不同——只要文件在目录里，之后启动的进程都能看到它。

```
post-fs-data.sh（在 system_server 启动前执行）
   → 准备一个目录：原有证书 + 你暂存的证书
   → bind mount 到 /apex/com.android.conscrypt/cacerts
        ↓
之后启动的任何进程列出该目录
   → 找到 <subject-hash>.<n>
   → 信任它
```

文件名遵循 Android 的真实规范：

```
name = MD5(Subject 原始 DER) 前 4 字节，小端序  →  <hash>.<n>
```

已在真机 `/apex/com.android.conscrypt/cacerts/` 的 **149 张证书**上
**149/149 全部验证通过**。

---

## 2.0.0 移除了什么

### keybox 生成 —— 已移除

自签名 keybox 无法通过任何谷歌认证，生成它没有实际价值。

### keybox 分发到 TEE 模块 —— 已移除

把 `keybox.xml` 装进 Oh My Keymint / Tricky Store / TEESimulator 技术上可行，
但它只对认证伪装有意义，而本模块已不再做那件事。保留它反而会暗示本模块
能帮助通过认证，这与事实不符。

### OEM 认证信任 Overlay（RRO）—— 尝试过，不可能实现

目标是覆盖框架资源数组 `array/vendor_required_attestation_certificates`，
让 KeyAttestation 显示「本设备信任该根证书」。

**在现代 Android 上这做不到：**

- `framework-res.apk` **完全没有 `overlayable.xml`**，第三方 overlay 无权覆盖
  框架资源。
- OverlayManagerService 只接受与目标同签名的 overlay，或预装进系统镜像的。
- 即使把 APK 在 `PackageManager` 扫描**之前**就 bind mount 进 `/product/overlay`，
  且 `PackageManager` 确实成功解析了它，注册仍被拒绝：
  `the overlay lacks <overlay android:targetName>`。
  没有可填的值，因为目标包压根没声明 overlayable 组。

已在 Android 16 / ColorOS 实测确认。完整尝试记录保留在
[CHANGELOG.md](./CHANGELOG.md)。

---

## 功能

- **导入一张或多张 CA 证书** —— 单个文件可含多个 PEM 块，自动去重，
  每张证书成为独立列表项。
- **实时状态** —— 状态卡显示绿/黄/红，以及总数与生效数。
  「生效」是验证出来的：暂存的 `<hash>.<n>` 确实出现在真实系统库中。
- **列表管理** —— 启用/禁用、删除（带确认）、置顶。
- **74 种语言** —— 自动识别系统语言，手动切换并持久化。
- **明暗主题** —— 跟随系统，手动切换并持久化。
- **更新保留数据** —— `customize.sh` 会暂存并还原 `data/`。

---

## 挂载

本模块在 `post-fs-data.sh` 里**自己挂载**，并附带 `skip_mount`，
让元模块不要插手。

为什么不交给元模块：使用 **VFS 路径重定向**的元模块（NoMount 等）
**对目录枚举不可见**。CA 库是靠 `readdir` 读取的，重定向对它完全无效——
必须用真实的 bind mount。

| 内容 | 模块内暂存位置 | 挂载到 |
|---|---|---|
| CA 证书 | `data/apex/com.android.conscrypt/cacerts/` | `/apex/com.android.conscrypt/cacerts` |

bind mount 会合并原有证书与暂存证书，不丢失任何文件。

两种踩过的坑已被显式防护：

- `post-fs-data.sh` **绝不删除正在被 bind mount 的目录**——那会产生
  `/deleted` 挂载和空目录树。
- 暂存时会校验写入的文件非空；对活动的 bind mount 做原地写入，
  可能静默产生 0 字节文件。

---

## 状态颜色

| 颜色 | 含义 |
|---|---|
| 🟢 绿 | 至少一项启用，且所有启用项都已生效 |
| 🟡 黄 | 部分启用项生效 |
| 🔴 红 | 全部未启用，或无启用项生效 |

---

## 安装

1. 在 KernelSU / Magisk / APatch 中刷入 `Any_CA-v2.0.0.zip`。
2. 打开模块 **WebUI**。
3. 导入 CA 证书。
4. 启用模块并**重启**——需要重启才能让 bind mount 对所有进程生效，
   包括已在运行的进程。

---

## 目录结构

```text
Any-CA/
├── README.md / README_ZH.md
├── CHANGELOG.md
├── LICENSE                     GPL-3.0
├── NOTICE.md                   第三方声明
├── update.json
├── build.sh
├── verify.sh
└── module/
    ├── module.prop
    ├── customize.sh
    ├── service.sh
    ├── uninstall.sh
    ├── post-fs-data.sh         ★ 执行 CA bind mount
    ├── skip_mount              ★ 让元模块跳过本模块
    ├── scripts/
    │   ├── common.sh           路径与公共函数
    │   ├── trust.sh            CA 暂存（去重、回滚、校验）
    │   ├── list.sh             列表操作
    │   └── status.sh           颜色与计数
    └── webroot/
        ├── index.html
        ├── style.css / miuix.css
        ├── app.js              状态、列表、弹窗
        ├── app2.js             CA 导入、语言、关于
        ├── hashlib.js          PEM/DER 解析 + Android CA 命名哈希
        └── i18n*.js            74 语言注册表
```

---

## 风险声明

> **系统 CA 信任与 root 操作存在风险。仅用于你自己的设备，操作前务必备份数据。**

- 本模块会修改**系统信任库**。错误的信任锚可能导致应用 TLS 校验失败。
- 一切可逆：卸载并重启即可恢复原状。

---

## 许可

**GPL-3.0** —— 开源，**禁止闭源再分发**。
详见 [LICENSE](./LICENSE) 与 [NOTICE.md](./NOTICE.md)。

---

## 致谢

- **miuix**（Apache-2.0）—— UI 设计语言参考。miuix 是 Kotlin/Compose 库，
  因此**未使用任何源代码**；界面是基于该设计语言的独立 CSS 实现。
- **AOSPGenKeyBox**（GPL-3.0）—— 开发 keybox 生成功能时，参考了 Android
  Keystore `KeyDescription` 的 ASN.1 结构。**未包含任何代码**，
  该功能已在 2.0.0 移除。

---

## 更新日志

见 [CHANGELOG.md](./CHANGELOG.md)。
