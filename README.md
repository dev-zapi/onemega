<div align="center">

# 🌐 ZeroOmega

**A modern proxy management browser extension**

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Install-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/pfnededegaaopdmhkdmcofjmoldfiped)
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Install-FF7139?logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/zeroomega/)
[![Edge Add-on](https://img.shields.io/badge/Edge-Install-0078D7?logo=microsoftedge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/dmaldhchmoaaopdmhkdmcofjmoldfiped)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Translation](https://hosted.weblate.org/widgets/switchyomega/-/svg-badge.svg)](https://hosted.weblate.org/engage/switchyomega/)

*Manage and switch between multiple proxies quickly & easily.*

</div>

---

## ✨ Features

- 🔄 **Quick Switch** - Change proxy with one click from popup
- 📋 **Multiple Profiles** - Direct, System, Fixed Proxy, PAC Script, Auto Switch
- 🎯 **Smart Rules** - Auto-switch based on URL patterns, domains, or wildcards
- 📦 **Import/Export** - Backup and restore your configurations
- 🌍 **Cross-Browser** - Works on Chrome, Firefox, and Edge

## 📥 Installation

| Browser | Link |
|---------|------|
| Chrome | [Chrome Web Store](https://chromewebstore.google.com/detail/pfnededegaaopdmhkdmcofjmoldfiped) |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/zeroomega/) |
| Edge | [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/dmaldhchmoaaopdmhkdmcofjmoldfiped) |

Or download from [Releases](https://github.com/zero-peak/ZeroOmega/releases) for manual installation.

## 🛠️ Development

### Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript |
| UI | Svelte 5 |
| Build | Vite |
| CSS | Tailwind CSS v4 |
| Testing | Vitest |
| Package Manager | pnpm |

### Quick Start

```bash
# Install dependencies
pnpm install

# Build extension
cd packages/extension && pnpm build

# Run tests
pnpm -r test

# Development mode
pnpm dev
```

### Project Structure

```
packages/
├── pac/          # PAC script generation library
├── core/         # Options management library
└── extension/    # Browser extension (Svelte 5 UI)
```

### Load Extension

1. Build: `cd packages/extension && pnpm build`
2. Open Chrome → `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" → Select `packages/extension/dist/chrome`

## 🌍 Translation

Help translate ZeroOmega on [Weblate](https://hosted.weblate.org/engage/switchyomega/).

[![Translation Status](https://hosted.weblate.org/widgets/switchyomega/-/287x66-white.png)](https://hosted.weblate.org/engage/switchyomega/)

## 📄 License

[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0)

---

<details>
<summary>中文说明</summary>

### 简介

ZeroOmega 是一款现代化的浏览器代理管理扩展，支持 Chrome、Firefox 和 Edge。

### 功能

- 快速切换代理配置
- 多种代理模式：直连、系统代理、固定代理、PAC 脚本、自动切换
- 基于 URL 规则的智能切换
- 配置导入/导出

### 开发

```bash
pnpm install
cd packages/extension && pnpm build
```

### 声明

ZeroOmega 是独立开源项目，未与任何代理/VPN提供商合作。

</details>
