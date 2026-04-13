# Changelog

All notable changes to InstaRemix are documented here.

---

## [3.0.0] — 2025-04

### Added
- **10 visual themes** — CLI, Vaporwave, Cyberpunk, Zen, Cherry Blossom, Lava, Arctic, Toxic, Gold Luxury, Default
- **5 mood presets** — Focus, Chill, Creative, Hacker, Luxury (one-click full setups)
- **Profile Widget** — floating card that auto-reads Instagram profile data (name, avatar, stats, bio)
- **Layout modes** — Default, Magazine (full-width), Grid (2-column)
- **9 background presets** — Aurora, Cosmos, Forest, City, Ocean, Desert, Neon, Sakura, Mauxx
- Redesigned popup UI with 5 tabs: BG, Theme, Layout, Widget, More
- Widget preview panel in popup
- Footer with mauxxai.online link

### Changed
- Complete rewrite of `inject.js` — new background strategy using real DOM element at `z-index: -9999`
- Full CSS rewrite with scoped theme variables
- Popup expanded to 380px width

---

## [2.0.0] — 2025-04

### Added
- Local image upload (FileReader → chrome.storage.local)
- Drag & drop upload zone
- Upload preview in popup
- Fixed background injection using `<img>` DOM element (bypasses Instagram CSP)

### Fixed
- Background images not loading (CSS variable approach blocked by Instagram's CSP)

---

## [1.0.0] — 2025-04

### Initial Release
- Custom background images via URL, color picker, CSS gradient
- 6 preset photos (Unsplash)
- Glassmorphism card effect
- Dark mode boost, focus mode, hide sidebar, hide suggestions
- Custom fonts, accent color, border radius
- Chrome storage sync
- SPA navigation support (MutationObserver)
