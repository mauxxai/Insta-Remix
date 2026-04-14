(() => {
// InstaRemix Popup v4.0 — by Mauxx AI · mauxxai.online

const PRESETS = [
  { name:'AURORA',  url:'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80', grad:'linear-gradient(135deg,#0d1b2a,#1b4332)' },
  { name:'COSMOS',  url:'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80', grad:'linear-gradient(135deg,#0f0c29,#302b63)' },
  { name:'FOREST',  url:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80', grad:'linear-gradient(135deg,#134e5e,#71b280)' },
  { name:'CITY',    url:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80', grad:'linear-gradient(135deg,#1a1a2e,#16213e)' },
  { name:'OCEAN',   url:'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80', grad:'linear-gradient(135deg,#1e3c72,#2a5298)' },
  { name:'DESERT',  url:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80', grad:'linear-gradient(135deg,#c9a96e,#8B4513)' },
  { name:'NEON',    url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80', grad:'linear-gradient(135deg,#2d1b69,#11998e)' },
  { name:'SAKURA',  url:'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80', grad:'linear-gradient(135deg,#fce4ec,#f48fb1)' },
  { name:'MAUXX',   url:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&q=80', grad:'linear-gradient(135deg,#7c3aed,#a78bfa)' },
];

const THEMES = [
  { id:'cli',       label:'CLI_HACKER', bg:'#00ff41' },
  { id:'brutalist', label:'BRUTALIST',  bg:'#ffde03' },
  { id:'y2k',       label:'Y2K_CHROME', bg:'#ff71ce' },
  { id:'aero',      label:'AERO_GLASS', bg:'#00d2ff' },
  { id:'synth',     label:'SYNTH_WAVE', bg:'#ff00ff' },
];

const MOODS = [
  { id:'focus',    icon:'🎯', label:'Focus',   preset:'CITY',   theme:'cli',       font:"'Space Mono',monospace" },
  { id:'chill',    icon:'😌', label:'Chill',   preset:'OCEAN',  theme:'aero',      font:'' },
  { id:'creative', icon:'🎨', label:'Create',  preset:'NEON',   theme:'synth',     font:'' },
  { id:'hacker',   icon:'💻', label:'Hacker',  preset:'COSMOS', theme:'cli',       font:"'Courier New',monospace" },
  { id:'luxury',   icon:'👑', label:'Luxury',  preset:'MAUXX',  theme:'brutalist', font:"'Georgia',serif" },
];

const LAYOUTS = [
  { id:'default',  icon:'📄', label:'Default' },
  { id:'magazine', icon:'📰', label:'Magazine' },
  { id:'grid',     icon:'⊞',  label:'Grid' },
];

let settings = {
  enabled:false, bgType:'preset', bgValue:PRESETS[0].url,
  bgOpacity:1, bgBlur:0, theme:'default',
  glassmorph:false, cardBlur:12, layoutMode:'default',
  hideSidebar:false, hideRecs:false, focusMode:false,
  customFont:'', accentColor:'#a78bfa', borderRadius:8,
  showDownloadBar:true, enterpriseMode:false
};

// ── Init ─────────────────────────────────────────────
function init() {
  chrome.storage.sync.get('irSettings', (data) => {
    if (data.irSettings) Object.assign(settings, data.irSettings);
    buildPresets(); buildThemes(); buildMoods(); buildLayouts();
    syncUI(); bindEvents(); loadLocalPreview();
  });
}

// ── Builders ─────────────────────────────────────────
function buildPresets() {
  const grid = document.getElementById('presetsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  PRESETS.forEach(p => {
    const c = document.createElement('div');
    c.className = 'preset-card';
    c.style.background = p.grad;
    c.innerHTML = `<span>${p.name}</span>`;
    if (settings.bgType === 'preset' && settings.bgValue === p.url) c.classList.add('selected');
    c.addEventListener('click', () => {
      document.querySelectorAll('.preset-card').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      settings.bgValue = p.url; settings.bgType = 'preset';
    });
    grid.appendChild(c);
  });
}

function buildThemes() {
  const grid = document.getElementById('themeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  THEMES.forEach(t => {
    const c = document.createElement('div');
    c.className = 'theme-card';
    c.style.background = t.bg;
    c.innerHTML = `<span>${t.label}</span>`;
    if (settings.theme === t.id) c.classList.add('selected');
    c.addEventListener('click', () => {
      document.querySelectorAll('.theme-card').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      settings.theme = t.id;
    });
    grid.appendChild(c);
  });
}

function buildMoods() {
  const grid = document.getElementById('moodGrid');
  if (!grid) return;
  grid.innerHTML = '';
  MOODS.forEach(m => {
    const c = document.createElement('div');
    c.className = 'mood-card';
    c.innerHTML = `<span class="mood-icon">${m.icon}</span><div class="mood-label">${m.label}</div>`;
    c.addEventListener('click', () => {
      document.querySelectorAll('.mood-card').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      const preset = PRESETS.find(p => p.name === m.preset);
      if (preset) { settings.bgType='preset'; settings.bgValue=preset.url; buildPresets(); }
      settings.theme = m.theme; buildThemes();
      if (m.font) { settings.customFont=m.font; document.getElementById('fontSelect').value=m.font; }
      else { settings.customFont=''; document.getElementById('fontSelect').value=''; }
    });
    grid.appendChild(c);
  });
}

function buildLayouts() {
  const grid = document.getElementById('layoutGrid');
  if (!grid) return;
  grid.innerHTML = '';
  LAYOUTS.forEach(l => {
    const c = document.createElement('div');
    c.className = 'layout-card';
    c.innerHTML = `<span class="layout-icon">${l.icon}</span><div class="layout-label">${l.label}</div>`;
    if (settings.layoutMode === l.id) c.classList.add('selected');
    c.addEventListener('click', () => {
      document.querySelectorAll('.layout-card').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      settings.layoutMode = l.id;
    });
    grid.appendChild(c);
  });
}

// ── Sync UI ───────────────────────────────────────────
function syncUI() {
  document.getElementById('mainToggle')?.classList.toggle('on', settings.enabled);
  const toggleLabel = document.getElementById('toggleLabel');
  if (toggleLabel) toggleLabel.textContent = settings.enabled ? 'ON' : 'OFF';
  showBgSection(settings.bgType);
  document.querySelectorAll('[data-bgtype]').forEach(p => p.classList.toggle('active', p.dataset.bgtype === settings.bgType));
  setRange('bgOpacity', settings.bgOpacity, v => Math.round(v*100)+'%', 'bgOpacityVal');
  setRange('bgBlur', settings.bgBlur, v => v+'px', 'bgBlurVal');
  setRange('cardBlur', settings.cardBlur, v => v+'px', 'cardBlurVal');
  setRange('borderRadius', settings.borderRadius, v => v+'px', 'borderRadiusVal');
  const accentColor = document.getElementById('accentColor');
  if (accentColor) accentColor.value = settings.accentColor;
  const fontSelect = document.getElementById('fontSelect');
  if (fontSelect) fontSelect.value = settings.customFont || '';
  if (settings.bgType === 'gradient') {
    const gradInput = document.getElementById('gradientInput');
    if (gradInput) gradInput.value = settings.bgValue;
  }
  if (settings.bgType === 'url') {
    const urlInput = document.getElementById('bgUrlInput');
    if (urlInput) urlInput.value = settings.bgValue;
  }
  document.getElementById('glassToggle')?.classList.toggle('on', settings.glassmorph);
  document.getElementById('glass-controls')?.classList.toggle('hidden', !settings.glassmorph);
  document.getElementById('dlBarToggle')?.classList.toggle('on', settings.showDownloadBar !== false);
  document.getElementById('enterpriseToggle')?.classList.toggle('on', settings.enterpriseMode === true);
  setMini('focusToggle', settings.focusMode);
  setMini('sidebarToggle', settings.hideSidebar);
  setMini('recsToggle', settings.hideRecs);
}

function showBgSection(type) {
  ['preset','local','url','color','gradient'].forEach(t =>
    document.getElementById('wrap-'+t)?.classList.toggle('hidden', t !== type));
}
function setRange(id, val, fmt, lid) {
  const el = document.getElementById(id);
  const lbl = document.getElementById(lid);
  if (el) { el.value=val; if(lbl) lbl.textContent=fmt(val); }
}
function setMini(id, val) { document.getElementById(id)?.classList.toggle('on', val); }

function loadLocalPreview() {
  chrome.storage.local.get('irLocalBg', (data) => {
    if (data.irLocalBg) {
      const up = document.getElementById('uploadPreview');
      const uf = document.getElementById('uploadFilename');
      if (up) { up.src = data.irLocalBg; up.classList.add('show'); }
      if (uf) { uf.textContent = 'Saved image'; uf.classList.add('show'); }
    }
  });
}

// ── UPLINK ENGINE (Internalized) ──
let peer = null;
let localStream = null;

function initUplink() {
  const status = document.getElementById('uplink-status');
  const btnStart = document.getElementById('btn-uplink-start');
  const btnStop = document.getElementById('btn-uplink-stop');
  const ticker = document.getElementById('popup-ticker');

  if (!btnStart) return;

  btnStart.onclick = async () => {
    if(status) status.innerHTML = 'ENGINE_WAKING...<br>REQUESTING_HARDWARE';
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const localVideo = document.getElementById('v-local');
      if (localVideo) localVideo.srcObject = localStream;

      const arr = new Uint8Array(6);
      crypto.getRandomValues(arr);
      const entropy = btoa(String.fromCharCode(...arr)).replace(/[+/=]/g, '').slice(0, 8);
      const peerId = `ib_uplink_${entropy}`;
      peer = new Peer(peerId);

      peer.on('open', (id) => {
        if(status) {
          status.innerHTML = 'UPLINK_STABLE<br>NODE_ID: ' + id;
          setTimeout(() => { status.style.display = 'none'; }, 2000);
        }
        if(ticker) ticker.innerHTML += `> Handshake established: ${id}<br>`;
      });

      peer.on('call', (call) => {
        call.answer(localStream);
        call.on('stream', (remote) => {
           const remoteVideo = document.getElementById('v-remote');
           if (remoteVideo) remoteVideo.srcObject = remote;
           if(ticker) ticker.innerHTML += `> Inbound stream detected...<br>`;
        });
      });

      if(ticker) ticker.innerHTML += `> Initializing PeerJS Subnet...<br>`;
    } catch(e) { if(status) status.innerHTML = 'HARDWARE_DENIED'; }
  };

  btnStop.onclick = () => {
    peer?.destroy();
    localStream?.getTracks().forEach(t => t.stop());
    if (status) {
      status.style.display = 'flex';
      status.innerHTML = 'UPLINK_TERMINATED';
    }
    if (ticker) ticker.innerHTML += `> Connection severed.<br>`;
  };
}

// ── Download logic ────────────────────────────────────
const DL_PREFIX = 'Insta-Remix_Mauxx-AI';
function getFilename(type, ext) {
  const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  return `${DL_PREFIX}_${type}_${ts}.${ext}`;
}

function setDlStatus(msg, cls='') {
  const el = document.getElementById('dlStatus');
  if (el) { el.textContent = msg; el.className = 'dl-status ' + cls; }
}

async function downloadFromUrl(instaUrl) {
  const btn = document.getElementById('dlFetchBtn');
  if (!btn) return;
  btn.disabled = true; btn.textContent = '⏳ Fetching...';
  setDlStatus('Resolving media URL...', 'loading');

  try {
    let type = 'post';
    if (instaUrl.includes('/reel')) type = 'reel';
    else if (instaUrl.includes('/stories')) type = 'story';

    const res = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        url: instaUrl.trim(),
        vQuality: 'max',
        filenamePattern: 'basic',
        isAudioOnly: false,
        disableMetadata: false
      })
    });

    if (!res.ok) throw new Error('API error: ' + res.status);
    const data = await res.json();

    if (data.status === 'error' || data.status === 'rate-limit') {
      throw new Error(data.text || 'API returned error');
    }

    let downloadUrl = null;
    let ext = 'mp4';

    if (data.status === 'stream' || data.status === 'redirect') {
      downloadUrl = data.url;
      ext = data.url?.includes('.jpg') || data.url?.includes('.webp') ? 'jpg' : 'mp4';
    } else if (data.status === 'picker') {
      downloadUrl = data.picker?.[0]?.url;
      ext = downloadUrl?.includes('.jpg') ? 'jpg' : 'mp4';
      setDlStatus(`📦 Carousel: downloading first of ${data.picker.length} items`, 'loading');
    }

    if (!downloadUrl) throw new Error('No downloadable URL found');

    setDlStatus('Downloading...', 'loading');
    btn.textContent = '⏳ Saving...';

    // Route through the background service worker — anchor download is blocked for cross-origin URLs
    await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'downloadFile', url: downloadUrl, filename: getFilename(type, ext) },
        (res) => {
          if (res?.success) resolve();
          else reject(new Error(res?.error || 'Download agent failed'));
        }
      );
    });

    setDlStatus('✓ Download started! Check your Downloads folder.', 'ok');
  } catch(e) {
    console.error('[InstaRemix DL]', e);
    setDlStatus('✗ ' + (e.message || 'Download failed.'), 'err');
  } finally {
    btn.disabled = false; btn.textContent = '⬇ Download';
  }
}

// ── Events ────────────────────────────────────────────
function bindEvents() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
    });
  });

  document.getElementById('masterToggle')?.addEventListener('click', () => {
    settings.enabled = !settings.enabled;
    document.getElementById('mainToggle')?.classList.toggle('on', settings.enabled);
    const toggleLabel = document.getElementById('toggleLabel');
    if (toggleLabel) toggleLabel.textContent = settings.enabled ? 'ON' : 'OFF';
  });

  document.querySelectorAll('[data-bgtype]').forEach(pill => {
    pill.addEventListener('click', () => {
      settings.bgType = pill.dataset.bgtype;
      document.querySelectorAll('[data-bgtype]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      showBgSection(settings.bgType);
      if (settings.bgType==='color') {
        const picker = document.getElementById('bgColorPicker');
        if (picker) settings.bgValue = picker.value;
      }
      if (settings.bgType==='preset') { settings.bgValue=PRESETS[0].url; buildPresets(); }
    });
  });

  const fileInput = document.getElementById('fileInput');
  const uploadZone = document.getElementById('uploadZone');
  if (fileInput) fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  if (uploadZone) {
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault(); uploadZone.classList.remove('drag-over');
      const f = e.dataTransfer.files[0];
      if (f?.type.startsWith('image/')) handleFile(f);
    });
  }

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      chrome.storage.local.set({ irLocalBg: dataUrl }, () => {
        const up = document.getElementById('uploadPreview');
        const uf = document.getElementById('uploadFilename');
        if (up) { up.src = dataUrl; up.classList.add('show'); }
        if (uf) { uf.textContent = file.name; uf.classList.add('show'); }
        settings.bgType='local'; settings.bgValue='local';
        document.querySelectorAll('[data-bgtype]').forEach(p => p.classList.remove('active'));
        document.querySelector('[data-bgtype="local"]')?.classList.add('active');
        showBgSection('local');
      });
    };
    reader.readAsDataURL(file);
  }

  bindRange('bgOpacity', v => { settings.bgOpacity=+v; return Math.round(v*100)+'%'; }, 'bgOpacityVal');
  bindRange('bgBlur', v => { settings.bgBlur=+v; return v+'px'; }, 'bgBlurVal');
  bindRange('cardBlur', v => { settings.cardBlur=+v; return v+'px'; }, 'cardBlurVal');
  bindRange('borderRadius', v => { settings.borderRadius=+v; return v+'px'; }, 'borderRadiusVal');

  document.getElementById('accentColor')?.addEventListener('input', e => { settings.accentColor=e.target.value; });
  document.getElementById('bgColorPicker')?.addEventListener('input', e => { if (settings.bgType==='color') settings.bgValue=e.target.value; });
  document.getElementById('gradientInput')?.addEventListener('input', e => { if (settings.bgType==='gradient') settings.bgValue=e.target.value; });
  document.getElementById('bgUrlInput')?.addEventListener('input', e => { if (settings.bgType==='url') settings.bgValue=e.target.value; });
  document.getElementById('fontSelect')?.addEventListener('change', e => { settings.customFont=e.target.value; });

  document.getElementById('glassToggle')?.addEventListener('click', () => {
    settings.glassmorph=!settings.glassmorph;
    document.getElementById('glassToggle')?.classList.toggle('on', settings.glassmorph);
    document.getElementById('glass-controls')?.classList.toggle('hidden', !settings.glassmorph);
  });

  initUplink();

  document.getElementById('dlBarToggle')?.addEventListener('click', () => {
    settings.showDownloadBar = !settings.showDownloadBar;
    document.getElementById('dlBarToggle')?.classList.toggle('on', settings.showDownloadBar);
  });
  document.getElementById('enterpriseToggle')?.addEventListener('click', () => {
    settings.enterpriseMode = !settings.enterpriseMode;
    document.getElementById('enterpriseToggle')?.classList.toggle('on', settings.enterpriseMode);
  });

  document.getElementById('launchEnterprise')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('client/inssist.html') });
  });

  document.getElementById('openDashboard')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  });

  bindMini('focusToggle','focusMode');
  bindMini('sidebarToggle','hideSidebar');
  bindMini('recsToggle','hideRecs');

  document.getElementById('dlFetchBtn')?.addEventListener('click', () => {
    const url = document.getElementById('dlUrlInput').value.trim();
    if (!url) { setDlStatus('✗ Please paste an Instagram URL first', 'err'); return; }
    if (!url.includes('instagram.com')) { setDlStatus('✗ Only Instagram URLs supported', 'err'); return; }
    downloadFromUrl(url);
  });
  document.getElementById('dlClearBtn')?.addEventListener('click', () => {
    const inp = document.getElementById('dlUrlInput');
    if (inp) inp.value='';
    setDlStatus('');
  });
  document.getElementById('dlUrlInput')?.addEventListener('keydown', e => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('dlFetchBtn')?.click(); }
  });

  document.getElementById('saveBtn')?.addEventListener('click', save);
}

function bindRange(id, setter, lid) {
  document.getElementById(id)?.addEventListener('input', e => {
    const lbl = document.getElementById(lid);
    if(lbl) lbl.textContent = setter(e.target.value);
  });
}
function bindMini(id, key) {
  document.getElementById(id)?.addEventListener('click', () => {
    settings[key]=!settings[key];
    document.getElementById(id).classList.toggle('on', settings[key]);
  });
}

function save() {
  chrome.storage.sync.set({ irSettings: settings }, () => {
    chrome.tabs.query({ active:true, currentWindow:true }, (tabs) => {
      if (tabs[0]?.url?.includes('instagram.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { action:'updateSettings', settings }, () => {
          if (chrome.runtime.lastError) {
             console.log('[InstaRemix] Tab messaging suppressed (content script not ready)');
          }
        });
      }
    });
    const s = document.getElementById('status');
    if (s) {
      s.textContent = '✓ Applied!';
      setTimeout(()=>{ s.textContent=''; }, 2000);
    }
  });
}

init();
})();

