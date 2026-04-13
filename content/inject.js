// ═══════════════════════════════════════════════════════
//  InstaRemix v3.1 — Content Script
//  by Mauxx AI · mauxxai.online
//  github.com/mauxxai/Insta-Remix
// ═══════════════════════════════════════════════════════

const DEFAULTS = {
  enabled: false, bgType: 'preset', bgValue: '',
  bgOpacity: 1, bgBlur: 0, theme: 'default',
  glassmorph: false, cardBlur: 12, layoutMode: 'default',
  hideSidebar: false, hideRecs: false, focusMode: false,
  customFont: '', accentColor: '#a78bfa', borderRadius: 8,
  showProfileWidget: true, showDownloadBar: true,
};

const THEME_CLASSES = ['ir-theme-cli','ir-theme-vaporwave','ir-theme-cyberpunk',
  'ir-theme-zen','ir-theme-cherry','ir-theme-lava','ir-theme-arctic','ir-theme-toxic','ir-theme-gold'];
const LAYOUT_CLASSES = ['ir-layout-magazine','ir-layout-grid'];

let settings = { ...DEFAULTS };
let widgetHidden = false;

// ── Apply ────────────────────────────────────────────
function applySettings(s) {
  const body = document.body;
  if (!s.enabled) {
    body.classList.remove('ir-active','ir-glassmorphism','ir-focus-mode',
      'ir-hide-sidebar','ir-hide-suggestions','ir-custom-font',...THEME_CLASSES,...LAYOUT_CLASSES);
    removeBgLayer(); removeWidget(); removeBadge(); removeDownloadButtons();
    return;
  }
  body.classList.add('ir-active');
  body.style.setProperty('--ir-accent', s.accentColor);
  body.style.setProperty('--ir-border-radius', s.borderRadius + 'px');
  body.style.setProperty('--ir-card-blur', s.cardBlur + 'px');

  THEME_CLASSES.forEach(c => body.classList.remove(c));
  if (s.theme && s.theme !== 'default') body.classList.add('ir-theme-' + s.theme);

  LAYOUT_CLASSES.forEach(c => body.classList.remove(c));
  if (s.layoutMode && s.layoutMode !== 'default') body.classList.add('ir-layout-' + s.layoutMode);

  buildBgLayer(s);
  toggleClass(body, 'ir-glassmorphism', s.glassmorph);
  toggleClass(body, 'ir-focus-mode', s.focusMode);
  toggleClass(body, 'ir-hide-sidebar', s.hideSidebar);
  toggleClass(body, 'ir-hide-suggestions', s.hideRecs);

  if (s.customFont) { body.classList.add('ir-custom-font'); body.style.setProperty('--ir-font', s.customFont); }
  else body.classList.remove('ir-custom-font');

  if (s.showProfileWidget && !widgetHidden) buildWidget(s);
  else removeWidget();

  addBadge();

  // Download buttons — inject after short delay for DOM to settle
  if (s.showDownloadBar !== false) {
    setTimeout(injectDownloadButtons, 1200);
  } else {
    removeDownloadButtons();
  }
}

// ── Background ───────────────────────────────────────
function buildBgLayer(s) {
  removeBgLayer();
  const layer = document.createElement('div');
  layer.id = 'ir-bg-layer';
  layer.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-9999;pointer-events:none;overflow:hidden;opacity:${s.bgOpacity};`;

  if (s.bgType === 'color' || s.bgType === 'gradient') {
    const fill = document.createElement('div');
    fill.style.cssText = `width:100%;height:100%;background:${s.bgValue};`;
    layer.appendChild(fill);
  } else if (s.bgType === 'url' || s.bgType === 'preset') {
    const img = document.createElement('img');
    img.src = s.bgValue;
    img.style.cssText = `width:100%;height:100%;object-fit:cover;object-position:center;display:block;filter:blur(${s.bgBlur}px);transform:scale(${s.bgBlur>0?1.06:1});transition:filter 0.3s;`;
    img.onerror = () => { layer.innerHTML=''; const f=document.createElement('div'); f.style.cssText='width:100%;height:100%;background:#1a1a2e;'; layer.appendChild(f); };
    layer.appendChild(img);
  } else if (s.bgType === 'local') {
    chrome.storage.local.get('irLocalBg', (data) => {
      if (!data.irLocalBg) return;
      const img = document.createElement('img');
      img.src = data.irLocalBg;
      img.style.cssText = `width:100%;height:100%;object-fit:cover;object-position:center;display:block;filter:blur(${s.bgBlur}px);transform:scale(${s.bgBlur>0?1.06:1});`;
      layer.appendChild(img);
    });
  }
  document.body.insertBefore(layer, document.body.firstChild);
}
function removeBgLayer() { document.getElementById('ir-bg-layer')?.remove(); }

// ── Profile Widget ───────────────────────────────────
function buildWidget(s) {
  removeWidget();
  const data = scrapeProfile();

  const w = document.createElement('div');
  w.id = 'ir-profile-widget';

  // Avatar HTML
  const avatarHtml = data.avatar
    ? `<img class="ir-pw-avatar" src="${data.avatar}" alt="">`
    : `<div class="ir-pw-avatar-placeholder">👤</div>`;

  w.innerHTML = `
    <div class="ir-pw-inner">
      ${avatarHtml}
      <div class="ir-pw-info">
        <span class="ir-pw-name">${escHtml(data.name || 'Instagram User')}</span>
        <span class="ir-pw-handle">${data.handle ? '@'+escHtml(data.handle) : window.location.hostname}</span>
      </div>
    </div>
    <div class="ir-pw-stats">
      <div class="ir-pw-stat">
        <span class="ir-pw-stat-num">${data.posts || '—'}</span>
        <span class="ir-pw-stat-label">Posts</span>
      </div>
      <div class="ir-pw-stat">
        <span class="ir-pw-stat-num">${data.followers || '—'}</span>
        <span class="ir-pw-stat-label">Followers</span>
      </div>
      <div class="ir-pw-stat">
        <span class="ir-pw-stat-num">${data.following || '—'}</span>
        <span class="ir-pw-stat-label">Following</span>
      </div>
    </div>
    <div class="ir-pw-footer">
      <span class="ir-pw-brand">INSTAREMIX</span>
      <span class="ir-pw-close" id="ir-pw-close">✕</span>
    </div>`;

  document.body.appendChild(w);
  document.getElementById('ir-pw-close')?.addEventListener('click', () => {
    widgetHidden = true; removeWidget();
  });
}

function scrapeProfile() {
  const d = {};
  try {
    // ── Handle from URL ──
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length && !['explore','reels','direct','stories','accounts','p'].includes(parts[0])) {
      d.handle = parts[0];
    }

    // ── Avatar: look for profile pic in header area ──
    // Instagram renders profile pic as img inside header or near the top of main
    const avatarCandidates = [
      ...document.querySelectorAll('header img'),
      ...document.querySelectorAll('main img'),
      ...document.querySelectorAll('nav img'),
      ...document.querySelectorAll('img[alt*="profile"], img[alt*="avatar"]'),
    ];
    for (const img of avatarCandidates) {
      if (img.src && (img.src.includes('cdninstagram') || img.src.includes('fbcdn'))
          && img.naturalWidth >= 30 && img.naturalWidth <= 200) {
        d.avatar = img.src; break;
      }
    }

    // ── On a profile page: scrape name, stats, bio ──
    if (parts.length === 1) {
      // Name: usually an h1 or h2 near the profile header
      const nameEl = document.querySelector('main h1, main h2, header h1, header h2');
      if (nameEl) d.name = nameEl.textContent.trim().slice(0, 40);

      // Stats: Instagram renders them as list items with a number + label
      // Pattern: <li><a><span>139</span></a><span>followers</span></li>
      const listItems = document.querySelectorAll('main ul li, header ul li');
      listItems.forEach(li => {
        const text = li.textContent.toLowerCase();
        const numEl = li.querySelector('span[class]') || li.querySelector('span');
        const num = numEl ? numEl.textContent.trim() : '';
        if (text.includes('post')) d.posts = num;
        else if (text.includes('follower')) d.followers = num;
        else if (text.includes('following')) d.following = num;
      });

      // Fallback: look for numbers near known labels anywhere in main
      if (!d.posts || !d.followers) {
        document.querySelectorAll('main a[href*="followers"], main a[href*="following"]').forEach(a => {
          const num = a.querySelector('span')?.textContent?.trim() || a.textContent.trim().split(' ')[0];
          if (a.href.includes('followers')) d.followers = num;
          else if (a.href.includes('following')) d.following = num;
        });
        // Posts count
        const postLink = document.querySelector('main a[href$="/"]');
        if (postLink) {
          const spans = postLink.querySelectorAll('span');
          if (spans.length) d.posts = spans[0].textContent.trim();
        }
      }
    }

    // ── Sidebar / nav avatar for logged-in user ──
    if (!d.name) {
      // Try the account switcher or nav area for logged-in user's name
      const navImgs = document.querySelectorAll('nav img, [role="navigation"] img');
      for (const img of navImgs) {
        if (img.src && (img.src.includes('cdninstagram') || img.src.includes('fbcdn'))) {
          d.avatar = img.src; break;
        }
      }
      // Try to get name from meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        const content = ogTitle.getAttribute('content') || '';
        // Format: "Name (@handle)"
        const match = content.match(/^(.+?)\s*\(@([^)]+)\)/);
        if (match) { d.name = match[1].trim(); if (!d.handle) d.handle = match[2]; }
        else d.name = content.split('•')[0].trim().slice(0, 40);
      }
    }

  } catch(e) { console.warn('[InstaRemix] scrape error', e); }
  return d;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function removeWidget() { document.getElementById('ir-profile-widget')?.remove(); }

// ── Download Buttons ─────────────────────────────────
const DL_PREFIX = 'Insta-Remix_Mauxx-AI';

function getFilename(type, ext) {
  const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  return `${DL_PREFIX}_${type}_${ts}.${ext}`;
}

async function downloadUrl(url, filename) {
  try {
    const res = await fetch(url, { mode:'cors', credentials:'omit' });
    if (!res.ok) throw new Error(res.status);
    const blob = await res.blob();
    const ext = blob.type.includes('video') ? 'mp4' : blob.type.includes('png') ? 'png' : 'jpg';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || getFilename('media', ext);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    return true;
  } catch(e) { console.error('[InstaRemix DL]', e); return false; }
}

function findMediaInEl(el) {
  // video first
  const vid = el.querySelector('video[src], video source');
  if (vid) return { type:'video', url: vid.src || vid.querySelector('source')?.src };
  // highest-res img
  let bestImg = null, bestW = 0;
  el.querySelectorAll('img').forEach(img => {
    if ((img.src.includes('cdninstagram') || img.src.includes('fbcdn')) && img.naturalWidth > bestW) {
      bestW = img.naturalWidth; bestImg = img;
    }
  });
  if (bestImg) return { type:'image', url: bestImg.src };
  return null;
}

function detectContext() {
  const p = location.pathname;
  if (p.includes('/stories/')) return 'story';
  if (p.includes('/reel') ) return 'reel';
  if (p.match(/\/p\//)) return 'post';
  return 'post';
}

function injectDownloadButtons() {
  // Posts in feed
  document.querySelectorAll('article').forEach(article => {
    if (article.querySelector('.ir-dl-btn-post')) return;
    article.style.position = 'relative';

    const btn = document.createElement('div');
    btn.className = 'ir-dl-btn-post';
    btn.title = 'Download (InstaRemix)';
    btn.innerHTML = '⬇';

    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); e.preventDefault();
      btn.innerHTML = '…';
      const media = findMediaInEl(article);
      if (!media) { showToast('No media found', true); btn.innerHTML='⬇'; return; }
      const ext = media.type === 'video' ? 'mp4' : 'jpg';
      const ok = await downloadUrl(media.url, getFilename(detectContext(), ext));
      if (ok) { btn.innerHTML = '✓'; btn.classList.add('done'); setTimeout(()=>{ btn.innerHTML='⬇'; btn.classList.remove('done'); }, 2500); showToast('Downloaded!'); }
      else { btn.innerHTML = '⬇'; showToast('Failed — try right-click > Save', true); }
    });

    article.appendChild(btn);
  });

  // Reel page — single centered button
  if (location.pathname.includes('/reel')) {
    if (!document.getElementById('ir-dl-reel-btn')) {
      const btn = document.createElement('div');
      btn.id = 'ir-dl-reel-btn';
      btn.innerHTML = '⬇ Download Reel';
      btn.addEventListener('click', async () => {
        btn.innerHTML = '…';
        const vid = document.querySelector('video');
        if (!vid?.src) { showToast('Reel not ready yet', true); btn.innerHTML='⬇ Download Reel'; return; }
        const ok = await downloadUrl(vid.src, getFilename('reel','mp4'));
        btn.innerHTML = ok ? '✓ Saved!' : '⬇ Download Reel';
        if (ok) { showToast('Reel downloaded!'); setTimeout(()=>{ btn.innerHTML='⬇ Download Reel'; },2500); }
        else showToast('Failed — video may be DRM protected', true);
      });
      document.body.appendChild(btn);
    }
  } else {
    document.getElementById('ir-dl-reel-btn')?.remove();
  }
}

function removeDownloadButtons() {
  document.querySelectorAll('.ir-dl-btn-post').forEach(b => b.remove());
  document.getElementById('ir-dl-reel-btn')?.remove();
}

// ── Toast ────────────────────────────────────────────
function showToast(msg, isErr=false) {
  let t = document.getElementById('ir-toast');
  if (!t) { t=document.createElement('div'); t.id='ir-toast'; document.body.appendChild(t); }
  t.textContent = isErr ? '✗ '+msg : '✓ '+msg;
  t.className = isErr ? 'ir-err' : '';
  void t.offsetWidth;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'), 3000);
}

// ── Utils ─────────────────────────────────────────────
function toggleClass(el, cls, cond) { cond ? el.classList.add(cls) : el.classList.remove(cls); }
function addBadge() {
  if (document.getElementById('ir-badge')) return;
  const b=document.createElement('div'); b.id='ir-badge'; b.textContent='INSTAREMIX';
  document.body.appendChild(b);
}
function removeBadge() { document.getElementById('ir-badge')?.remove(); }

// ── Load & message listener ───────────────────────────
function loadAndApply() {
  chrome.storage.sync.get('irSettings', (data) => {
    if (data.irSettings) settings = { ...DEFAULTS, ...data.irSettings };
    widgetHidden = false;
    applySettings(settings);
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'updateSettings') {
    settings = { ...DEFAULTS, ...msg.settings };
    widgetHidden = false;
    applySettings(settings);
  }
  if (msg.action === 'getProfile') {
    const d = scrapeProfile();
    try { chrome.runtime.sendMessage({ action:'profileData', data:d }); } catch(e) {}
  }
});

loadAndApply();

// Re-scrape widget after page content loads
setTimeout(() => {
  if (settings.enabled && settings.showProfileWidget && !widgetHidden) buildWidget(settings);
}, 2000);

// SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    widgetHidden = false;
    setTimeout(() => {
      loadAndApply();
      // Re-inject download buttons on new page
      if (settings.enabled && settings.showDownloadBar !== false) {
        setTimeout(injectDownloadButtons, 1500);
      }
    }, 800);
  }
}).observe(document, { subtree:true, childList:true });

// Re-inject download buttons when new posts load (infinite scroll)
let dlObserver = null;
function startDlObserver() {
  dlObserver?.disconnect();
  dlObserver = new MutationObserver(() => {
    if (settings.enabled && settings.showDownloadBar !== false) injectDownloadButtons();
  });
  dlObserver.observe(document.body, { childList:true, subtree:true });
}
startDlObserver();
