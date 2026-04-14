(() => {
// ═══════════════════════════════════════════════════════
//  InstaBook Secure v4.0.0 — Enterprise Suite Core
//  Architected by Mauxx AI
// ═══════════════════════════════════════════════════════

if (window.InstaBookInitialized) return;
window.InstaBookInitialized = true;

const InstaBook = {
  config: {
    defaults: {
      enabled: false, bgType: 'preset', bgValue: '',
      bgOpacity: 1, bgBlur: 0, theme: 'default',
      glassmorph: false, cardBlur: 12, layoutMode: 'default',
      hideSidebar: false, hideRecs: false, focusMode: false,
      customFont: '', accentColor: '#a78bfa', borderRadius: 8,
      showDownloadBar: true, enterpriseMode: false
    },
    themes: [
      'ir-theme-cli', 'ir-theme-brutalist', 'ir-theme-y2k',
      'ir-theme-aero', 'ir-theme-acid', 'ir-theme-synth'
    ],
    layouts: ['ir-layout-magazine', 'ir-layout-grid']
  },

  state: {
    settings: {},
    shadowRoot: null,
    observer: null
  },

  // ── Components ─────────────────────────────────────
  UI: {
    initShadow() {
      if (InstaBook.state.shadowRoot) return;
      const host = document.createElement('div');
      host.id = 'instabook-secure-root';
      host.style.cssText = 'position:fixed;top:0;left:0;z-index:999999;pointer-events:none;';
      document.body.appendChild(host);
      InstaBook.state.shadowRoot = host.attachShadow({ mode: 'open' });
      
      // Inject Shadow Styles
      const style = document.createElement('style');
      style.textContent = `
        :host { --accent: #a78bfa; }
        .toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%) translateY(100px); background:rgba(12,12,20,0.9); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:10px 20px; border-radius:10px; font-family:sans-serif; font-size:13px; transition:all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); opacity:0; pointer-events:auto; }
        .toast.show { transform:translateX(-50%) translateY(0); opacity:1; }
        .badge { position:fixed; top:15px; left:15px; font-size:9px; font-weight:900; background:linear-gradient(135deg,#7c3aed,#a78bfa); color:#fff; padding:3px 8px; border-radius:4px; letter-spacing:1px; opacity:0.8; }
      `;
      InstaBook.state.shadowRoot.appendChild(style);
    },

    showToast(msg, isErr = false) {
      InstaBook.UI.initShadow();
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = (isErr ? '✗ ' : '✓ ') + msg;
      if (isErr) t.style.borderColor = '#f87171';
      InstaBook.state.shadowRoot.appendChild(t);
      
      setTimeout(() => t.classList.add('show'), 100);
      setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 500);
      }, 3500);
    },

    addBadge() {
      if (InstaBook.state.shadowRoot.querySelector('.badge')) return;
      const b = document.createElement('div');
      b.className = 'badge';
      b.textContent = 'INSTABOOK_SECURE_ENTERPRISE';
      InstaBook.state.shadowRoot.appendChild(b);
    }
  },

  // ── Controllers ────────────────────────────────────
  Controllers: {
    Layout: {
      apply(s) {
        const body = document.body;
        if (!s.enabled) {
          body.classList.remove('ir-active', 'ir-glassmorphism', 'ir-focus-mode', 
            'ir-hide-sidebar', 'ir-hide-suggestions', 'ir-custom-font', 
            ...InstaBook.config.themes, ...InstaBook.config.layouts);
          return;
        }
        body.classList.add('ir-active');
        body.style.setProperty('--ir-accent', s.accentColor);
        body.style.setProperty('--ir-border-radius', s.borderRadius + 'px');
        body.style.setProperty('--ir-card-blur', s.cardBlur + 'px');

        InstaBook.config.themes.forEach(c => body.classList.remove(c));
        if (s.theme && s.theme !== 'default') body.classList.add('ir-theme-' + s.theme);

        InstaBook.config.layouts.forEach(c => body.classList.remove(c));
        if (s.layoutMode && s.layoutMode !== 'default') body.classList.add('ir-layout-' + s.layoutMode);

        InstaBook.Utils.toggleClass(body, 'ir-glassmorphism', s.glassmorph);
        InstaBook.Utils.toggleClass(body, 'ir-focus-mode', s.focusMode);
        InstaBook.Utils.toggleClass(body, 'ir-hide-sidebar', s.hideSidebar);
        InstaBook.Utils.toggleClass(body, 'ir-hide-suggestions', s.hideRecs);

        if (s.customFont) {
          body.classList.add('ir-custom-font');
          body.style.setProperty('--ir-font', s.customFont);
        } else {
          body.classList.remove('ir-custom-font');
        }

        InstaBook.Controllers.Layout.applyBg(s);
      },

      applyBg(s) {
        document.getElementById('ir-bg-layer')?.remove();
        document.body.classList.remove('ir-has-custom-bg');
        if (!s.enabled) return;

        const layer = document.createElement('div');
        layer.id = 'ir-bg-layer';
        layer.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;overflow:hidden;opacity:${s.bgOpacity};`;

        if ((s.bgType === 'preset' || s.bgType === 'url') && s.bgValue) {
          document.body.classList.add('ir-has-custom-bg');
          const img = document.createElement('img');
          img.src = s.bgValue; // already a full URL for presets; direct URL for url type
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center;display:block;';
          if (s.bgBlur > 0) img.style.filter = `blur(${s.bgBlur}px)`;
          layer.appendChild(img);
        } else if (s.bgType === 'local') {
          document.body.classList.add('ir-has-custom-bg');
          chrome.storage.local.get('irLocalBg', (data) => {
            if (data.irLocalBg) {
              const img = document.createElement('img');
              img.src = data.irLocalBg;
              img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center;display:block;';
              if (s.bgBlur > 0) img.style.filter = `blur(${s.bgBlur}px)`;
              layer.appendChild(img);
            }
          });
        } else if (s.bgType === 'color' && s.bgValue) {
          document.body.classList.add('ir-has-custom-bg');
          const fill = document.createElement('div');
          fill.style.cssText = `width:100%;height:100%;background-color:${s.bgValue};`;
          layer.appendChild(fill);
        } else if (s.bgType === 'gradient' && s.bgValue) {
          document.body.classList.add('ir-has-custom-bg');
          const fill = document.createElement('div');
          fill.style.cssText = `width:100%;height:100%;background:${s.bgValue};`;
          layer.appendChild(fill);
        } else {
          return; // no valid bg configured
        }

        document.body.appendChild(layer);
      }
    },

    Media: {
      async injectButtons() {
        const s = InstaBook.state.settings;
        if (!s.enabled || s.showDownloadBar === false) {
          document.querySelectorAll('.ir-dl-btn-post').forEach(b => b.remove());
          document.getElementById('ir-dl-reel-btn')?.remove();
          return;
        }

        // Feed Articles
        document.querySelectorAll('article:not([data-ib-processed])').forEach(article => {
          article.setAttribute('data-ib-processed', 'true');
          article.style.position = 'relative';

          const btn = document.createElement('div');
          btn.className = 'ir-dl-btn-post';
          btn.title = 'Secure Save (InstaBook)';
          btn.innerHTML = '⬇';

          btn.addEventListener('click', async (e) => {
            e.stopPropagation(); e.preventDefault();
            btn.innerHTML = '…';
            const media = InstaBook.Utils.findMedia(article);
            if (!media) { InstaBook.UI.showToast('No media found', true); btn.innerHTML='⬇'; return; }
            
            const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
            const ext = media.type === 'video' ? 'mp4' : 'jpg';
            const filename = `InstaBook_Secure_${media.type}_${ts}.${ext}`;
            
            chrome.runtime.sendMessage({ action: 'downloadFile', url: media.url, filename }, (res) => {
              if (res?.success) {
                btn.innerHTML = '✓';
                btn.classList.add('done');
                setTimeout(() => { btn.innerHTML='⬇'; btn.classList.remove('done'); }, 2500);
                InstaBook.UI.showToast('Media Secured!');
              } else {
                btn.innerHTML = '⬇';
                InstaBook.UI.showToast('Failed to secure media', true);
              }
            });
          });
          article.appendChild(btn);
        });

        // Reel Page
        if (location.pathname.includes('/reel/')) {
          if (!document.getElementById('ir-dl-reel-btn')) {
            const btn = document.createElement('div');
            btn.id = 'ir-dl-reel-btn';
            btn.innerHTML = '⬇ Secure Reel';
            btn.onclick = () => {
              const vid = document.querySelector('video');
              let videoUrl = null;
              if (vid) {
                const source = vid.querySelector('source[src]');
                const candidate = (source && source.src) || vid.src || '';
                if (candidate && !candidate.startsWith('blob:')) videoUrl = candidate;
              }
              if (!videoUrl) { InstaBook.UI.showToast('Reel source not accessible', true); return; }
              const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
              btn.innerHTML = '…';
              chrome.runtime.sendMessage(
                { action: 'downloadFile', url: videoUrl, filename: `InstaBook_Reel_${ts}.mp4` },
                (res) => {
                  if (res?.success) {
                    btn.innerHTML = '✓ Secured';
                    setTimeout(() => { btn.innerHTML = '⬇ Secure Reel'; }, 2500);
                    InstaBook.UI.showToast('Reel Secured!');
                  } else {
                    btn.innerHTML = '⬇ Secure Reel';
                    InstaBook.UI.showToast('Download failed', true);
                  }
                }
              );
            };
            document.body.appendChild(btn);
          }
        }
      }
    }
  },

  // ── Utility Functions ──────────────────────────────
  Utils: {
    toggleClass(el, cls, cond) { cond ? el.classList.add(cls) : el.classList.remove(cls); },
    
    findMedia(el) {
      // Check video[src] or video > source[src]; skip blob: URLs (page-scoped, SW can't fetch them)
      const vid = el.querySelector('video[src]') || el.querySelector('video');
      if (vid) {
        const source = vid.querySelector('source[src]');
        const src = (source && source.src) || vid.src || '';
        if (src && !src.startsWith('blob:')) return { type: 'video', url: src };
      }

      let bestImg = null, bestW = 0;
      el.querySelectorAll('img').forEach(img => {
        if (img.naturalWidth > bestW) {
          bestW = img.naturalWidth; bestImg = img;
        }
      });
      return bestImg ? { type: 'image', url: bestImg.src } : null;
    },

    debounce(fn, delay) {
      let timer = null;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    }
  },

  // ── Core Lifecycle ─────────────────────────────────
  apply() {
    InstaBook.UI.initShadow();
    InstaBook.Controllers.Layout.apply(InstaBook.state.settings);
    InstaBook.Controllers.Media.injectButtons();
    if (InstaBook.state.settings.enabled) InstaBook.UI.addBadge();
  },

  init() {
    chrome.storage.sync.get('irSettings', (data) => {
      InstaBook.state.settings = { ...InstaBook.config.defaults, ...data.irSettings };
      InstaBook.apply();
      InstaBook.startObserver();
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'updateSettings') {
        InstaBook.state.settings = { ...InstaBook.config.defaults, ...msg.settings };
        InstaBook.apply();
      }
    });

    console.log('%c[InstaBook Secure] v4.0.0 Enterprise Core Initialized', 'color: #7c3aed; font-weight: bold;');
  },

  startObserver() {
    if (InstaBook.state.observer) InstaBook.state.observer.disconnect();
    
    const debouncedInject = InstaBook.Utils.debounce(() => {
      if (InstaBook.state.settings.enabled) InstaBook.Controllers.Media.injectButtons();
    }, 500);

    InstaBook.state.observer = new MutationObserver((mutations) => {
      const hasStructuralChange = mutations.some(m => m.addedNodes.length > 0);
      if (hasStructuralChange) debouncedInject();
    });

    InstaBook.state.observer.observe(document.body, { childList: true, subtree: true });
  }
};

InstaBook.init();
})();

