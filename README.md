<div align="center">

# ✦ InstaRemix

### Instagram Designer Chrome Extension

**Redesign your entire Instagram web experience — backgrounds, themes, profile widgets, and more.**

[![Made by Mauxx AI](https://img.shields.io/badge/Made%20by-Mauxx%20AI-7c3aed?style=flat-square)](https://mauxxai.online)
[![Version](https://img.shields.io/badge/Version-3.0.0-a78bfa?style=flat-square)](https://github.com/mauxxai/Insta-Remix/releases)
[![License](https://img.shields.io/badge/License-MIT-4ade80?style=flat-square)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-f59e0b?style=flat-square&logo=googlechrome)](https://github.com/mauxxai/Insta-Remix)

[🌐 mauxxai.online](https://mauxxai.online) · [📦 Releases](https://github.com/mauxxai/Insta-Remix/releases) · [🐛 Issues](https://github.com/mauxxai/Insta-Remix/issues)

</div>

---

## 🖼 Features

### Background Designer
- **9 Photo Presets** — Aurora, Cosmos, Forest, City, Ocean, Desert, Neon, Sakura, Mauxx
- **Local Upload** — drag & drop or browse your own image (stored locally, no upload to servers)
- **Image URL** — any direct image link
- **Solid Color** — color picker
- **CSS Gradient** — paste any `linear-gradient(...)` string
- Opacity & blur controls

### 🎨 Themes (10 total)
| Theme | Vibe |
|-------|------|
| Default | Dark purple base |
| **CLI** | Matrix terminal green, monospace font |
| **Vaporwave** | Pink/cyan retrowave aesthetic |
| **Cyberpunk** | Yellow/red glitch energy |
| **Zen** | Minimal cool-slate midnight |
| **Cherry Blossom** | Soft pink Japanese aesthetic |
| **Lava** | Deep red/orange volcanic |
| **Arctic** | Icy blue-white frost |
| **Toxic** | Radioactive neon green glow |
| **Gold Luxury** | Matte black + gold accents |

### 😌 Mood Presets (one-click setups)
| Mood | Theme | Background | Font |
|------|-------|------------|------|
| 🎯 Focus | Zen | City | Space Mono |
| 😌 Chill | Arctic | Ocean | Default |
| 🎨 Creative | Vaporwave | Neon | Default |
| 💻 Hacker | CLI | Cosmos | Courier New |
| 👑 Luxury | Gold | Mauxx | Georgia |

### 📐 Layout Modes
- **Default** — standard Instagram layout
- **Magazine** — full-width immersive images
- **Grid** — 2-column compact card view

### 👤 Profile Widget
Floating card auto-reads your Instagram profile and displays:
- Avatar, name, username
- Posts / Followers / Following count
- Bio (truncated to 80 chars)
- Theme-matched styling

### ⚡ Power Features
- 🌑 Dark Mode Boost — true deep black UI
- 🎯 Focus Mode — 620px centered feed
- 🚫 Hide Sidebar — maximum content space
- 🙈 Hide Suggestions — no more "Suggested for you"
- 🔮 Glassmorphism Cards — frosted glass on posts
- Custom Typography (6 font options)
- Custom accent color
- Custom border radius

---

## 🚀 Install

### Developer Mode (current)

1. Download the latest release ZIP from [Releases](https://github.com/mauxxai/Insta-Remix/releases)
2. Extract the ZIP — you'll see an `insta-remix` folder
3. Open Chrome → go to `chrome://extensions`
4. Enable **Developer Mode** (top-right toggle)
5. Click **Load Unpacked**
6. Select the `insta-remix` folder (the one containing `manifest.json`)
7. Go to [instagram.com](https://instagram.com) → click the InstaRemix icon → toggle **ON** → **Apply**

> ⚠️ Select the inner `insta-remix` folder, not the outer ZIP wrapper folder.

---

## 📁 File Structure

```
insta-remix/
├── manifest.json              # Chrome extension config (MV3)
├── content/
│   ├── inject.js              # Content script — runs on instagram.com
│   └── inject.css             # Injected styles (themes, widget, transparency)
├── popup/
│   ├── popup.html             # Designer UI (380px popup)
│   └── popup.js               # UI logic, settings sync, file upload
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 🛠 How It Works

1. **Background stripping** — Injects CSS that forces `background-color: transparent !important` on Instagram's body and all known wrapper elements, removing their dark/white background entirely
2. **Background injection** — A `<div id="ir-bg-layer">` is inserted as the first child of `<body>` at `z-index: -9999`, containing an `<img>` (or color/gradient div) that renders behind all Instagram content
3. **Theme classes** — Theme-specific CSS classes are toggled on `<body>` (e.g. `ir-theme-cli`) applying scoped CSS variable overrides and text color rules
4. **Profile widget** — A floating `<div id="ir-profile-widget">` scrapes visible profile data from the DOM using `querySelectorAll` on known patterns and Instagram's URL structure
5. **SPA navigation** — A `MutationObserver` watches for URL changes to re-apply settings after Instagram's React router navigates between pages
6. **Storage** — Settings are saved to `chrome.storage.sync` (settings object). Local uploaded images are saved to `chrome.storage.local` (supports large base64 blobs)

---

## 🤝 Contributing

PRs welcome. Please open an issue first to discuss major changes.

```bash
git clone https://github.com/mauxxai/Insta-Remix.git
cd Insta-Remix
# Load the insta-remix/ folder as an unpacked extension in Chrome
```

---

## 📄 License

MIT © [Mauxx AI](https://mauxxai.online)

---

<div align="center">
  <strong>Built with ✦ by <a href="https://mauxxai.online">Mauxx AI</a></strong><br>
  <sub>Integration · AI · Automation</sub>
</div>
