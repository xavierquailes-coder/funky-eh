
function createBerriLoader(page) {
  const loader = document.createElement("div");
  loader.className = "bb-site-loader";
  loader.innerHTML = `
    <div class="bb-loader-content">
      <div class="bb-loader-logo">berri</div>
      <div class="bb-loader-dots"><span></span><span></span><span></span></div>
      <div class="bb-loader-label">Loading</div>
    </div>
  `;
  page.appendChild(loader);
  return loader;
}

function showBerriLoader(loader) {
  if (!loader) return;
  requestAnimationFrame(() => loader.classList.add("show"));
}

function hideBerriLoader(loader) {
  if (!loader) return;
  loader.classList.remove("show");
  setTimeout(() => loader.remove(), 350);
}


/* ---------------- Scramjet ---------------- */
let scramjetController = null;

async function getScramjetController() {
  if (!scramjetController) {
    scramjetController = await initBootstrap();
  }
  return scramjetController;
}

function scramjetPluginsFor(tab) {
  const cachePlugin = new $scramjetUtils.HttpCachePlugin();

  const urlWatcher = new $scramjetUtils.UrlWatcherPlugin((value) => {
    const url = typeof value === 'string'
      ? value
      : value?.href || value?.url || '';

    if (!url || url === 'undefined' || url === tab.url) return;

    tab.url = url;
    tab.title = url;

    if (tab.hist[tab.histIdx] !== url) {
      tab.hist = tab.hist.slice(0, tab.histIdx + 1);
      tab.hist.push(url);
      tab.histIdx = tab.hist.length - 1;
      addHistoryEntry(url);
    }

    if (tab.id === activeId) {
      document.getElementById('bbAddrInput').value = url;
      renderNavState();
    }
    renderTabstrip();
  });

  const catchEscapedLinks = new $scramjetUtils.CatchEscapedLinksPlugin(
    (value) => {
      const escapedUrl = typeof value === 'string'
        ? value
        : value?.href || value?.url || '';

      if (!escapedUrl) return new URL('/', location.origin);
      return new URL(`/?goto=${encodeURIComponent(escapedUrl)}`, location.origin);
    }
  );

  return [cachePlugin, urlWatcher, catchEscapedLinks];
}

/* ---------------- config ---------------- */
const ENGINES = {
  duckduckgo: { label: 'DuckDuckGo', url: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  brave:      { label: 'Brave Search', url: q => `https://search.brave.com/search?q=${encodeURIComponent(q)}` },
  google:     { label: 'Google', url: q => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  bing:       { label: 'Bing', url: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  ecosia:     { label: 'Ecosia', url: q => `https://www.ecosia.org/search?q=${encodeURIComponent(q)}` },
};

const DEFAULT_BOOKMARKS = [
  { name: 'YouTube', url: 'https://youtube.com', color: '#FF0033',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M9 7.5v9l8-4.5-8-4.5z"/></svg>' },
  { name: 'TikTok', url: 'https://tiktok.com', color: '#000000',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M14 3.5c.5 2.5 2.2 4 4.6 4.3v3c-1.7-.1-3.2-.6-4.6-1.6v5.6a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .9.07v3.1a2.1 2.1 0 1 0 1.5 2v-11.3H14z"/></svg>' },
  { name: 'Twitch', url: 'https://twitch.tv', color: '#6441A5',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M5 3l-1.5 4v12h4.5V21l3-2h3.5L19 14V3H5zm12 10l-2.5 2.5H11l-2 2v-2H6V5h11v8z"/><path d="M14.5 7h1.7v4.2h-1.7V7zm-4 0H12v4.2h-1.5V7z" fill="#6441A5"/></svg>' },
  { name: 'Twitter/X', url: 'https://x.com', color: '#0B0B0B',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M6.2 5l5 6.6L6 19h1.8l4.4-5.1 3.6 5.1H19l-5.3-7 5-6H17l-4 4.7L9.9 5H6.2z"/></svg>' },
  { name: 'GitHub', url: 'https://github.com', color: '#171515',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4M13.5 6.5l-3 11"/></svg>' },
  { name: 'Discord', url: 'https://discord.com', color: '#5865F2',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M8.5 6.5C6.8 6.9 5.5 7.6 5.5 7.6 4 10 3.5 12.4 3.7 14.7c0 0 1.4 1.7 4.3 1.9l.8-1.2c-1.4-.4-2-1-2-1s.15.1.4.25c1.9 1 4.6 1.55 6.8 1.55s4.9-.55 6.8-1.55c.25-.15.4-.25.4-.25s-.6.6-2 1l.8 1.2c2.9-.2 4.3-1.9 4.3-1.9.25-2.6-.4-5-1.9-7.1 0 0-1.3-.7-3-1.1l-.2.4c1.5.4 2.4 1 2.4 1a12 12 0 0 0-9.2-1.9 12 12 0 0 0-9.2 1.9s.9-.6 2.4-1l-.15-.4z"/><ellipse cx="9.2" cy="12.5" rx="1.3" ry="1.5" fill="#5865F2"/><ellipse cx="14.8" cy="12.5" rx="1.3" ry="1.5" fill="#5865F2"/></svg>' },
  { name: 'GeForce NOW', url: 'https://play.geforcenow.com', color: '#1A6E2E',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M6.5 15a4 4 0 0 1 .3-8 5.3 5.3 0 0 1 10-1.6A4.2 4.2 0 0 1 17.5 15h-11z"/><path d="M10.3 11.6v4.2l3.7-2.1-3.7-2.1z" fill="#1A6E2E"/></svg>' },
];


const START = 'berri://home';
const HISTORY_PAGE = 'berri://history';
const SETTINGS_PAGE = 'berri://settings';
const CHAT_PAGE = 'berri://chat';

/* ---------------- state ---------------- */
let bookmarks = loadJSON('berri_browser_bookmarks_v1', DEFAULT_BOOKMARKS);
let settings = loadJSON('berri_browser_settings_v1', { engine: 'duckduckgo' });
let history = loadJSON('berri_browser_history_v1', []);
let tabs = [];
let activeId = null;
let tabSeq = 0;
let enteringTabId = null;

function loadJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v || fallback; }
  catch (_) { return fallback; }
}
function saveBookmarks() { localStorage.setItem('berri_browser_bookmarks_v1', JSON.stringify(bookmarks)); }
function saveSettings() { localStorage.setItem('berri_browser_settings_v1', JSON.stringify(settings)); }
function saveHistory() { localStorage.setItem('berri_browser_history_v1', JSON.stringify(history)); }

function addHistoryEntry(url) {
  if (url === START || url === HISTORY_PAGE || url === SETTINGS_PAGE || url === CHAT_PAGE) return;
  history.unshift({ url, ts: Date.now() });
  if (history.length > 300) history.length = 300;
  saveHistory();
}

/* ---------------- helpers ---------------- */

function looksLikeUrl(text) {
  const t = text.trim();
  if (/^https?:\/\//i.test(t)) return true;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(t) && !t.includes(' ')) return true;
  return false;
}

function toUrl(text) {
  const t = text.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return 'https://' + t;
}

function faviconLetter(name) { return (name || '?').trim().charAt(0).toUpperCase(); }

function faviconUrl(url) {
  try { return `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`; }
  catch (_) { return ''; }
}

/* ---------------- tab model ---------------- */
function newTab(url) {
  const id = 'bbt' + (++tabSeq);
  const u = url || START;
  const tab = { id, url: u, title: internalLabel(u) || u, hist: [u], histIdx: 0 };
  tabs.push(tab);
  activeId = id;
  enteringTabId = id;
  renderAll();
  return tab;
}

function closeTab(id) {
  const idx = tabs.findIndex(t => t.id === id);
  if (idx === -1) return;
  const el = document.querySelector(`.bb-tab[data-id="${id}"]`);
  const doRemove = () => {
    const i = tabs.findIndex(t => t.id === id);
    if (i === -1) return;
    tabs.splice(i, 1);
    document.getElementById('page-' + id)?.remove();
    if (tabs.length === 0) { newTab(START); return; }
    if (activeId === id) activeId = tabs[Math.max(0, i - 1)].id;
    renderAll();
  };
  if (el) {
    el.classList.add('bb-tab-closing');
    setTimeout(doRemove, 160);
  } else {
    doRemove();
  }
}

function activeTab() { return tabs.find(t => t.id === activeId); }

function goTo(tab, url, pushHist) {
  tab.url = url;
  tab.title = internalLabel(url) || url;
  if (pushHist !== false) {
    tab.hist = tab.hist.slice(0, tab.histIdx + 1);
    tab.hist.push(url);
    tab.histIdx = tab.hist.length - 1;
  }
  if (pushHist !== false) addHistoryEntry(url);
  renderPageContent(tab);
  renderTabstrip();
  renderNavState();
  if (tab.id === activeId) document.getElementById('bbAddrInput').value = url;
}

function internalLabel(url) {
  if (url === START) return 'New Tab';
  if (url === HISTORY_PAGE) return 'History';
  if (url === SETTINGS_PAGE) return 'Settings';
  if (url === CHAT_PAGE) return 'Berri Chat';
  return null;
}

function navigateInput(raw) {
  const tab = activeTab();
  const value = raw.trim();
  if (!value) return;
  if (value.toLowerCase().startsWith('berri://')) {
    const internal = value.toLowerCase();
    const allowed = [START, HISTORY_PAGE, SETTINGS_PAGE, CHAT_PAGE];
    goTo(tab, allowed.includes(internal) ? internal : START);
    return;
  }
  let url;
  if (looksLikeUrl(value)) url = toUrl(value);
  else url = ENGINES[settings.engine].url(value);
  goTo(tab, url);
}

/* ---------------- rendering ---------------- */
function renderAll() {
  renderTabstrip();
  renderPages();
  renderNavState();
  const tab = activeTab();
  document.getElementById('bbAddrInput').value = tab ? tab.url : '';
}

function renderTabstrip() {
  const strip = document.getElementById('bbTabstrip');
  strip.innerHTML = '';
  tabs.forEach(t => {
    const el = document.createElement('div');
    el.className = 'bb-tab' + (t.id === activeId ? ' active' : '');
    el.dataset.id = t.id;
    el.draggable = true;
    const label = internalLabel(t.url) || (t.title || t.url).replace(/^https?:\/\//, '').split('/')[0];
    el.innerHTML = `<span class="bb-tab-title">${escapeHtml(label)}</span><span class="bb-tab-close">✕</span>`;
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('bb-tab-close')) { closeTab(t.id); return; }
      activeId = t.id;
      renderAll();
    });
    el.addEventListener('mousedown', (e) => { if (e.button === 1) { e.preventDefault(); closeTab(t.id); } });
    el.addEventListener('contextmenu', (e) => showTabContextMenu(e, t));
    el.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', t.id); el.classList.add('dragging'); });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    el.addEventListener('dragover', (e) => e.preventDefault());
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      if (!draggedId || draggedId === t.id) return;
      const fromIdx = tabs.findIndex(x => x.id === draggedId);
      const toIdx = tabs.findIndex(x => x.id === t.id);
      if (fromIdx === -1 || toIdx === -1) return;
      const [moved] = tabs.splice(fromIdx, 1);
      tabs.splice(toIdx, 0, moved);
      renderTabstrip();
    });
    if (t.id === enteringTabId) {
      el.classList.add('bb-tab-entering');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add('bb-tab-enter-active');
        el.classList.remove('bb-tab-entering');
      }));
    }
    strip.appendChild(el);
  });
  enteringTabId = null;
  const plus = document.createElement('div');
  plus.className = 'bb-newtab';
  plus.textContent = '+';
  plus.addEventListener('click', () => newTab(START));
  strip.appendChild(plus);
}

function renderPages() {
  const pages = document.getElementById('bbPages');
  // remove pages for tabs that no longer exist
  [...pages.children].forEach(el => {
    const id = el.id.replace('page-', '');
    if (!tabs.find(t => t.id === id)) el.remove();
  });
  tabs.forEach(t => {
    let page = document.getElementById('page-' + t.id);
    if (!page) {
      page = document.createElement('div');
      page.className = 'bb-page';
      page.id = 'page-' + t.id;
      pages.appendChild(page);
      renderPageContent(t);
    }
    page.classList.toggle('active', t.id === activeId);
  });
}

function renderPageContent(tab) {
  const page = document.getElementById('page-' + tab.id);
  if (!page) return;

  page.innerHTML = '';

  if (tab.url === START) {
    mountContent(page, buildStartPage(tab));
    return;
  }
  if (tab.url === HISTORY_PAGE) {
    mountContent(page, buildHistoryPage(tab));
    return;
  }
  if (tab.url === SETTINGS_PAGE) {
    mountContent(page, buildSettingsPage(tab));
    return;
  }
  if (tab.url === CHAT_PAGE) {
    if (typeof window.buildBerriChatPage !== 'function') {
      const error = document.createElement('div');
      error.className = 'bb-blocked';
      error.innerHTML = '<h3>Berri Chat is unavailable</h3><p>The internal chat module did not load.</p>';
      mountContent(page, error);
      return;
    }
    mountContent(page, window.buildBerriChatPage(tab));
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.className = 'bb-scramjet-frame';
  iframe.setAttribute(
    'allow',
    'autoplay; encrypted-media; picture-in-picture; clipboard-read; clipboard-write; fullscreen'
  );
  mountContent(page, iframe);

  openThroughScramjet(tab, iframe).catch((err) => {
    console.error('Scramjet failed:', err);
    page.innerHTML = '';
    const errorView = document.createElement('div');
    errorView.className = 'bb-blocked';
    errorView.innerHTML = `
      <h3>Page could not load</h3>
      <p>${escapeHtml(tab.url)}</p>
      <p>${escapeHtml(err?.message || 'Unknown Scramjet error')}</p>
      <button class="bb-settings-btn" type="button">Try again</button>
    `;
    errorView.querySelector('button').addEventListener('click', () => renderPageContent(tab));
    page.appendChild(errorView);
  });
}

function mountContent(page, content) {
  content.classList.add('bb-content-enter');
  content.style.height = '100%';
  page.appendChild(content);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    content.classList.add('bb-content-enter-active');
  }));
}

async function openThroughScramjet(tab, iframe) {
  const page = iframe.parentElement;
  const loader = createBerriLoader(page);
  showBerriLoader(loader);

  let loaderFinished = false;
  const finishLoading = () => {
    if (loaderFinished) return;
    loaderFinished = true;
    hideBerriLoader(loader);
  };

  try {
    const controller = await getScramjetController();
    const frame = controller.createFrame(iframe, {
      plugins: scramjetPluginsFor(tab),
    });

    tab.scramjetFrame = frame;
    tab.frameElement = iframe;

    iframe.addEventListener(
      "load",
      () => setTimeout(finishLoading, 450),
      { once: true }
    );

    await frame.go(tab.url);

    // Fallback for pages that never dispatch a normal frame load event.
    setTimeout(finishLoading, 10000);
  } catch (error) {
    finishLoading();
    throw error;
  }
}

function buildStartPage(tab) {
  const wrap = document.createElement('div');
  wrap.className = 'bb-start';

  const logo = document.createElement('div');
  logo.className = 'bb-logo';
  logo.textContent = 'berri';
  wrap.appendChild(logo);

  const form = document.createElement('form');
  form.className = 'bb-search-form';
  form.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    <input type="text" placeholder="Search anything!" autocomplete="off"/>
    <button type="submit" class="bb-search-go">Go</button>`;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = form.querySelector('input').value;
    if (val.trim()) navigateInput(val);
  });
  wrap.appendChild(form);

  const tag = document.createElement('div');
  tag.className = 'bb-engine-tag';
  tag.textContent = `Searching with ${ENGINES[settings.engine].label}`;
  wrap.appendChild(tag);

  const grid = document.createElement('div');
  grid.className = 'bb-bookmarks';
  bookmarks.forEach((bm, i) => {
    const item = document.createElement('div');
    item.className = 'bb-bm';
    const fallbackInner = bm.icon ? bm.icon : escapeHtml(faviconLetter(bm.name));
    const iconHtml = `<img src="${escapeAttr(faviconUrl(bm.url))}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
       <div class="bb-bm-fallback">${fallbackInner}</div>`;
    item.innerHTML = `<div class="bb-bm-remove" title="Remove">✕</div>
      <div class="bb-bm-icon" style="${bm.color ? `background:${bm.color}` : ''}">${iconHtml}</div>
      <div class="bb-bm-label">${escapeHtml(bm.name)}</div>`;
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('bb-bm-remove')) {
        bookmarks.splice(i, 1);
        saveBookmarks();
        renderPageContent(tab);
        return;
      }
      goTo(tab, bm.url);
    });
    grid.appendChild(item);
  });
  const addBtn = document.createElement('div');
  addBtn.className = 'bb-bm bb-bm-add';
  addBtn.innerHTML = `<div class="bb-bm-icon">+</div><div class="bb-bm-label">Add</div>`;
  addBtn.addEventListener('click', () => openAddBookmark());
  grid.appendChild(addBtn);
  wrap.appendChild(grid);

  return wrap;
}

function buildBlockedView(url) {
  const wrap = document.createElement('div');
  wrap.className = 'bb-blocked';
  let host = url;
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch (_) {}
  wrap.innerHTML = `
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M4.9 4.9l14.2 14.2"/></svg>
    <h3>${escapeHtml(host)} can't be shown here</h3>
    <p>This site blocks itself from being embedded inside other apps, including in-app browsers like this one — it's a restriction the site sets, not something Berri Browser can get around.</p>
    <a href="${escapeAttr(url)}" target="_blank" rel="noopener">Open in a new tab ↗</a>
  `;
  return wrap;
}

function buildHistoryPage(tab) {
  const wrap = document.createElement('div');
  wrap.className = 'bb-history';

  const head = document.createElement('div');
  head.className = 'bb-history-head';
  head.innerHTML = `<h2>History</h2><button class="bb-history-clear" id="bbHistClearInline">Clear all</button>`;
  head.querySelector('#bbHistClearInline').addEventListener('click', () => {
    history = [];
    saveHistory();
    renderPageContent(tab);
  });
  wrap.appendChild(head);

  if (history.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'bb-history-empty';
    empty.textContent = 'Nothing here yet — sites you visit will show up in this list.';
    wrap.appendChild(empty);
    return wrap;
  }

  const list = document.createElement('div');
  list.className = 'bb-history-list';
  history.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'bb-history-row';
    const time = new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let host = entry.url;
    try { host = new URL(entry.url).hostname.replace(/^www\./, ''); } catch (_) {}
    row.innerHTML = `<span class="bb-history-time">${escapeHtml(time)}</span>
      <div class="bb-history-info">
        <div class="bb-history-title">${escapeHtml(host)}</div>
        <div class="bb-history-url">${escapeHtml(entry.url)}</div>
      </div>`;
    row.addEventListener('click', () => goTo(tab, entry.url));
    list.appendChild(row);
  });
  wrap.appendChild(list);
  return wrap;
}

function buildSettingsPage(tab) {
  const wrap = document.createElement('div');
  wrap.className = 'bb-settings-page';

  const h2 = document.createElement('h2');
  h2.textContent = 'Settings';
  wrap.appendChild(h2);

  const engineSection = document.createElement('div');
  engineSection.className = 'bb-settings-section';
  engineSection.innerHTML = '<h4>Search engine</h4>';
  const engineList = document.createElement('div');
  Object.keys(ENGINES).forEach(key => {
    const row = document.createElement('label');
    row.className = 'bb-engine-opt';
    row.innerHTML = `<input type="radio" name="bbEngine" ${settings.engine === key ? 'checked' : ''}/> ${escapeHtml(ENGINES[key].label)}`;
    row.querySelector('input').addEventListener('change', () => {
      settings.engine = key;
      saveSettings();
      const startTab = tabs.find(t => t.url === START);
      if (startTab) renderPageContent(startTab);
    });
    engineList.appendChild(row);
  });
  engineSection.appendChild(engineList);
  wrap.appendChild(engineSection);

  const dataSection = document.createElement('div');
  dataSection.className = 'bb-settings-section';
  dataSection.innerHTML = '<h4>Data</h4>';
  const clearHistBtn = document.createElement('button');
  clearHistBtn.className = 'bb-settings-btn';
  clearHistBtn.textContent = 'Clear browsing history';
  clearHistBtn.addEventListener('click', () => {
    history = [];
    saveHistory();
    const histTab = tabs.find(t => t.url === HISTORY_PAGE);
    if (histTab) renderPageContent(histTab);
  });
  const resetBmBtn = document.createElement('button');
  resetBmBtn.className = 'bb-settings-btn';
  resetBmBtn.textContent = 'Reset bookmarks to default';
  resetBmBtn.addEventListener('click', () => {
    bookmarks = JSON.parse(JSON.stringify(DEFAULT_BOOKMARKS));
    saveBookmarks();
    const startTab = tabs.find(t => t.url === START);
    if (startTab) renderPageContent(startTab);
  });
  dataSection.appendChild(clearHistBtn);
  dataSection.appendChild(resetBmBtn);
  wrap.appendChild(dataSection);

  const shortcutsSection = document.createElement('div');
  shortcutsSection.className = 'bb-settings-section';
  shortcutsSection.innerHTML = `<h4>Keyboard shortcuts</h4>
    <div class="bb-shortcuts-list">
      <div class="bb-shortcut-row"><span>New tab</span><span class="bb-kbd">Alt+T</span></div>
      <div class="bb-shortcut-row"><span>Close tab</span><span class="bb-kbd">Alt+W</span></div>
      <div class="bb-shortcut-row"><span>Duplicate tab</span><span class="bb-kbd">Alt+D</span></div>
      <div class="bb-shortcut-row"><span>Focus address bar</span><span class="bb-kbd">/</span></div>
      <div class="bb-shortcut-row"><span>Reload</span><span class="bb-kbd">Alt+R</span></div>
      <div class="bb-shortcut-row"><span>Switch to tab 1–9</span><span class="bb-kbd">Alt+1–9</span></div>
      <div class="bb-shortcut-row"><span>Next / previous tab</span><span class="bb-kbd">Alt+]/[</span></div>
      <div class="bb-shortcut-row"><span>Back / forward</span><span class="bb-kbd">Alt+←/→</span></div>
      <div class="bb-shortcut-row"><span>History</span><span class="bb-kbd">Ctrl+Shift+H</span></div>
      <div class="bb-shortcut-row"><span>Close popup / menu</span><span class="bb-kbd">Esc</span></div>
    </div>`;
  wrap.appendChild(shortcutsSection);

  return wrap;
}

function showTabContextMenu(e, tab) {
  e.preventDefault();
  const menu = document.getElementById('bbCtxMenu');
  menu.innerHTML = '';
  const items = [
    { label: 'New tab', fn: () => newTab(START) },
    { label: 'Duplicate tab', fn: () => newTab(tab.url) },
    { label: 'Close tab', fn: () => closeTab(tab.id) },
    { label: 'Close other tabs', fn: () => {
        tabs.filter(t => t.id !== tab.id).forEach(t => document.getElementById('page-' + t.id)?.remove());
        tabs = tabs.filter(t => t.id === tab.id);
        activeId = tab.id;
        renderAll();
      } },
  ];
  items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'bb-ctx-item';
    row.textContent = it.label;
    row.addEventListener('click', () => { it.fn(); hideCtxMenu(); });
    menu.appendChild(row);
  });
  const x = Math.min(e.clientX, window.innerWidth - 190);
  const y = Math.min(e.clientY, window.innerHeight - 190);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.classList.add('open');
}
function hideCtxMenu() { document.getElementById('bbCtxMenu').classList.remove('open'); }
document.addEventListener('click', hideCtxMenu);
document.addEventListener('scroll', hideCtxMenu, true);

function renderNavState() {
  const tab = activeTab();
  document.getElementById('bbBack').disabled = !tab || tab.histIdx <= 0;
  document.getElementById('bbFwd').disabled = !tab || tab.histIdx >= tab.hist.length - 1;
}

function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s) { return escapeHtml(s); }

/* ---------------- bookmark modal ---------------- */
function openAddBookmark() {
  document.getElementById('bbBmName').value = '';
  document.getElementById('bbBmUrl').value = '';
  document.getElementById('bbAddBmOverlay').classList.add('open');
}
function closeAddBookmark() { document.getElementById('bbAddBmOverlay').classList.remove('open'); }

document.getElementById('bbBmCancel').addEventListener('click', closeAddBookmark);
document.getElementById('bbAddBmOverlay').addEventListener('click', (e) => { if (e.target.id === 'bbAddBmOverlay') closeAddBookmark(); });
document.getElementById('bbBmSave').addEventListener('click', () => {
  const name = document.getElementById('bbBmName').value.trim();
  let url = document.getElementById('bbBmUrl').value.trim();
  if (!name || !url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  bookmarks.push({ name, url });
  saveBookmarks();
  closeAddBookmark();
  const tab = activeTab();
  if (tab && tab.url === START) renderPageContent(tab);
});

/* ---------------- nav bar wiring ---------------- */
document.getElementById('bbAddrForm').addEventListener('submit', e => {
  e.preventDefault();
  navigateInput(document.getElementById('bbAddrInput').value);
});
document.getElementById('bbBack').addEventListener('click', () => {
  const tab = activeTab();
  if (!tab || tab.histIdx <= 0) return;
  tab.histIdx--;
  goTo(tab, tab.hist[tab.histIdx], false);
});
document.getElementById('bbFwd').addEventListener('click', () => {
  const tab = activeTab();
  if (!tab || tab.histIdx >= tab.hist.length - 1) return;
  tab.histIdx++;
  goTo(tab, tab.hist[tab.histIdx], false);
});
document.getElementById('bbReload').addEventListener('click', () => {
  const tab = activeTab();
  if (!tab) return;
  if (tab.scramjetFrame && !internalLabel(tab.url)) {
    tab.scramjetFrame.go(tab.url).catch(() => renderPageContent(tab));
  } else {
    renderPageContent(tab);
  }
});
document.getElementById('bbHome').addEventListener('click', () => {
  const tab = activeTab();
  if (tab) goTo(tab, START);
});
document.getElementById('bbHistoryBtn').addEventListener('click', () => {
  const tab = activeTab();
  if (tab) goTo(tab, HISTORY_PAGE);
});
document.getElementById('bbCloseApp').addEventListener('click', () => {
  if (window.parent !== window) {
    parent.postMessage({ type: 'berri-close-riw' }, '*');
  } else {
    window.close();
  }
});

/* ---------------- settings ---------------- */
document.getElementById('bbSettingsBtn').addEventListener('click', () => {
  const tab = activeTab();
  if (tab) goTo(tab, SETTINGS_PAGE);
});

/* ---------------- keyboard shortcuts ----------------
   Ctrl/Cmd+T, +W, +D, +L, +1-9, +Tab are reserved by real browser chrome
   itself (tabs, address bar) — no page-level JS can override those, in
   any browser, regardless of iframe nesting. Everything below uses
   combos browsers don't grab first, so they actually fire. */
document.addEventListener('keydown', (e) => {
  const bmOpen = document.getElementById('bbAddBmOverlay').classList.contains('open');
  const typing = /^(input|textarea)$/i.test(e.target.tagName || '');

  if (e.key === 'Escape') {
    if (bmOpen) { closeAddBookmark(); return; }
    hideCtxMenu();
    return;
  }
  if (bmOpen) return; // don't fire shortcuts while the add-bookmark modal has focus

  if (!typing && e.key === '/') { e.preventDefault(); const inp = document.getElementById('bbAddrInput'); inp.focus(); inp.select(); return; }
  if (typing) return; // let normal typing through everywhere else

  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') { e.preventDefault(); const t = activeTab(); if (t) goTo(t, HISTORY_PAGE); return; }
  if (e.altKey && e.key.toLowerCase() === 't') { e.preventDefault(); newTab(START); return; }
  if (e.altKey && e.key.toLowerCase() === 'w') { e.preventDefault(); if (activeId) closeTab(activeId); return; }
  if (e.altKey && e.key.toLowerCase() === 'd') { e.preventDefault(); const t = activeTab(); if (t) newTab(t.url); return; }
  if (e.altKey && e.key.toLowerCase() === 'r') { e.preventDefault(); const t = activeTab(); if (t) renderPageContent(t); return; }
  if (e.altKey && /^[1-9]$/.test(e.key)) {
    e.preventDefault();
    const idx = e.key === '9' ? tabs.length - 1 : parseInt(e.key, 10) - 1;
    if (tabs[idx]) { activeId = tabs[idx].id; renderAll(); }
    return;
  }
  if (e.altKey && (e.key === ']' || e.key === '[')) {
    e.preventDefault();
    if (tabs.length < 2) return;
    const curIdx = tabs.findIndex(t => t.id === activeId);
    const dir = e.key === ']' ? 1 : -1;
    const nextIdx = (curIdx + dir + tabs.length) % tabs.length;
    activeId = tabs[nextIdx].id;
    renderAll();
    return;
  }
  if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); document.getElementById('bbBack').click(); return; }
  if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); document.getElementById('bbFwd').click(); return; }
});

/* ---------------- init ---------------- */
const goto = new URL(location.href).searchParams.get('goto');
if (goto) {
  window.history.replaceState(null, '', location.pathname);
  newTab(goto);
} else {
  newTab(START);
}

/* ---------------- Berri Chat internal route ---------------- */
window.berriNavigateInternal = function(url){ const tab = activeTab(); if (tab) goTo(tab, url); };
document.getElementById('bbChatBtn')?.addEventListener('click', () => { const tab = activeTab(); if (tab) goTo(tab, CHAT_PAGE); });
