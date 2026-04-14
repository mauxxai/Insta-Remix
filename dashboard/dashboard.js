// MAUXX AI COMMAND CENTER — Logic v4.0.0
const THEMES = [
    { id: 'cli', label: 'CLI', color: '#00ff41' },
    { id: 'brutalist', label: 'BRUT', color: '#ffde03' },
    { id: 'y2k', label: 'Y2K', color: '#01cdfe' },
    { id: 'aero', label: 'AERO', color: '#00a8ff' },
    { id: 'acid', label: 'ACID', color: '#ccff00' },
    { id: 'synth', label: 'SYNTH', color: '#ff00ff' }
];

let settings = {};

async function init() {
    const data = await chrome.storage.sync.get('irSettings');
    settings = data.irSettings || {};
    
    renderThemes();
    syncUI();
    bindEvents();
}

function renderThemes() {
    const grid = document.getElementById('themeGrid');
    grid.innerHTML = '';
    THEMES.forEach(t => {
        const item = document.createElement('div');
        item.className = 'theme-item';
        if (settings.theme === t.id) item.classList.add('selected');
        item.style.backgroundColor = 'rgba(255,255,255,0.03)';
        item.innerHTML = `
            <div style="width:20px; height:20px; border-radius:50%; background:${t.color}"></div>
            <span>${t.label}</span>
        `;
        item.onclick = () => {
            settings.theme = t.id;
            save();
            renderThemes();
        };
        grid.appendChild(item);
    });
}

function syncUI() {
    document.getElementById('masterToggle').checked = settings.enabled;
    document.getElementById('accentColor').value = settings.accentColor || '#7c3aed';
    document.getElementById('borderRadius').value = settings.borderRadius || 8;
    document.getElementById('hideSidebar').checked = settings.hideSidebar;
    document.getElementById('hideRecs').checked = settings.hideRecs;
    document.getElementById('focusMode').checked = settings.focusMode;
}

function bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            item.classList.add('active');
            document.getElementById('tab-' + item.dataset.tab).classList.add('active');
            document.querySelector('.breadcrumb').textContent = `COMMAND_CENTER / ${item.dataset.tab.toUpperCase()}`;
        };
    });

    // Inputs
    document.getElementById('masterToggle').onchange = (e) => { settings.enabled = e.target.checked; save(); };
    document.getElementById('accentColor').oninput = (e) => { settings.accentColor = e.target.value; save(); };
    document.getElementById('borderRadius').oninput = (e) => { settings.borderRadius = e.target.value; save(); };
    document.getElementById('hideSidebar').onchange = (e) => { settings.hideSidebar = e.target.checked; save(); };
    document.getElementById('hideRecs').onchange = (e) => { settings.hideRecs = e.target.checked; save(); };
    document.getElementById('focusMode').onchange = (e) => { settings.focusMode = e.target.checked; save(); };

    // Buttons
    document.getElementById('launchIG').onclick = () => window.open('https://instagram.com', '_blank');
    document.getElementById('launchEnterprise').onclick = () => window.open(chrome.runtime.getURL('client/inssist.html'), '_blank');
    
    document.getElementById('resetSettings').onclick = () => {
        if(confirm('Reset all settings to MAUXX AI defaults?')) {
            settings = {
                enabled: false, bgType: 'preset', bgValue: '',
                bgOpacity: 1, bgBlur: 0, theme: 'default',
                glassmorph: false, cardBlur: 12, layoutMode: 'default',
                hideSidebar: false, hideRecs: false, focusMode: false,
                customFont: '', accentColor: '#7c3aed', borderRadius: 8,
                showDownloadBar: true, enterpriseMode: false
            };
            save();
            location.reload();
        }
    };

    document.getElementById('clearStorage').onclick = () => {
        chrome.storage.local.clear();
        alert('Local cache flushed.');
    };
}

function save() {
    chrome.storage.sync.set({ irSettings: settings });
    // Notify content scripts
    chrome.tabs.query({ url: "*://*.instagram.com/*" }, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'updateSettings', settings }, () => {
                chrome.runtime.lastError; // suppress error for tabs without content script
            });
        });
    });
}

init();
