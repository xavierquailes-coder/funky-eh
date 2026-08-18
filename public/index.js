async function resetScramjetOnce() {
  const key = "berri-scramjet-reset-v2";

  if (localStorage.getItem(key)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );

    const cacheKeys = await caches.keys();
    await Promise.all(
      cacheKeys.map((cacheKey) => caches.delete(cacheKey))
    );

    localStorage.setItem(key, "done");
    location.reload();
  } catch (error) {
    console.warn("One-time Scramjet reset failed:", error);
  }
}

resetScramjetOnce();

function createBerriLoader(page) {
  const loader = document.createElement("div");
  loader.className = "bb-site-loader";
  loader.innerHTML = `
    <div class="bb-loader-content">
      <div class="bb-loader-orb">
        <svg class="bb-loader-berry" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="14" r="7.5" fill="#E84F8A"/>
          <circle cx="8.5" cy="12" r="2.6" fill="#B23D6B" opacity="0.6"/>
          <path d="M12 6.5C12 4.5 13.5 3 15.5 3" stroke="#9FD183" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M12 6.5c1.6-1 2.2-2.6 1.6-4" stroke="#9FD183" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="bb-loader-label">Loading…</span>
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

function normalizeScramjetUrl(value) {
  if (typeof value === 'string') return value.trim();
  if (value instanceof URL) return value.href;

  const candidate =
    value?.href ??
    value?.url ??
    value?.detail?.href ??
    value?.detail?.url ??
    value?.target?.href ??
    '';

  return typeof candidate === 'string' ? candidate.trim() : '';
}

function isBrokenUrl(value) {
  const url = String(value || '').trim();
  return !url ||
    url === 'undefined' ||
    url === '/undefined' ||
    url.endsWith('/undefined') ||
    url.includes('fromUrl=%2Fundefined');
}

function scramjetPluginsFor(tab) {
  const cachePlugin = new $scramjetUtils.HttpCachePlugin();

  const urlWatcher = new $scramjetUtils.UrlWatcherPlugin((value) => {
    const url = normalizeScramjetUrl(value);
    if (isBrokenUrl(url) || url === tab.url) return;

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

  const catchEscapedLinks = new $scramjetUtils.CatchEscapedLinksPlugin((value) => {
    const escapedUrl = normalizeScramjetUrl(value);

    if (isBrokenUrl(escapedUrl)) {
      return new URL(
        `/?goto=${encodeURIComponent(tab.url)}`,
        location.origin
      );
    }

    return new URL(
      `/?goto=${encodeURIComponent(escapedUrl)}`,
      location.origin
    );
  });

  return [cachePlugin, urlWatcher, catchEscapedLinks];
}

/* ---------------- config ---------------- */
const ENGINES = {
  duckduckgo: { label: 'DuckDuckGo', url: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  brave: { label: 'Brave Search', url: q => `https://search.brave.com/search?q=${encodeURIComponent(q)}` },
  google: { label: 'Google', url: q => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  bing: { label: 'Bing', url: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  ecosia: { label: 'Ecosia', url: q => `https://www.ecosia.org/search?q=${encodeURIComponent(q)}` },
};

const DEFAULT_BOOKMARKS = [
  {
    name: 'YouTube',
    url: 'https://youtube.com',
    color: '#FF0033',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M9 7.5v9l8-4.5-8-4.5z"/></svg>'
  },
  {
    name: 'TikTok',
    url: 'https://tiktok.com',
    color: '#000000',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M14 3.5c.5 2.5 2.2 4 4.6 4.3v3c-1.7-.1-3.2-.6-4.6-1.6v5.6a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .9.07v3.1a2.1 2.1 0 1 0 1.5 2v-11.3H14z"/></svg>'
  },
  {
    name: 'Twitch',
    url: 'https://twitch.tv',
    color: '#6441A5',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M5 3l-1.5 4v12h4.5V21l3-2h3.5L19 14V3H5zm12 10l-2.5 2.5H11l-2 2v-2H6V5h11v8z"/><path d="M14.5 7h1.7v4.2h-1.7V7zm-4 0H12v4.2h-1.5V7z" fill="#6441A5"/></svg>'
  },
  {
    name: 'Twitter/X',
    url: 'https://x.com',
    color: '#0B0B0B',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M6.2 5l5 6.6L6 19h1.8l4.4-5.1 3.6 5.1H19l-5.3-7 5-6H17l-4 4.7L9.9 5H6.2z"/></svg>'
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    color: '#171515',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4M13.5 6.5l-3 11"/></svg>'
  },
  {
    name: 'Discord',
    url: 'https://discord.com',
    color: '#5865F2',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M8.5 6.5C6.8 6.9 5.5 7.6 5.5 7.6 4 10 3.5 12.4 3.7 14.7c0 0 1.4 1.7 4.3 1.9l.8-1.2c-1.4-.4-2-1-2-1s.15.1.4.25c1.9 1 4.6 1.55 6.8 1.55s4.9-.55 6.8-1.55c.25-.15.4-.25.4-.25s-.6.6-2 1l.8 1.2c2.9-.2 4.3-1.9 4.3-1.9.25-2.6-.4-5-1.9-7.1 0 0-1.3-.7-3-1.1l-.2.4c1.5.4 2.4 1 2.4 1a12 12 0 0 0-9.2-1.9 12 12 0 0 0-9.2 1.9s.9-.6 2.4-1l-.15-.4z"/><ellipse cx="9.2" cy="12.5" rx="1.3" ry="1.5" fill="#5865F2"/><ellipse cx="14.8" cy="12.5" rx="1.3" ry="1.5" fill="#5865F2"/></svg>'
  },
  {
    name: 'GeForce NOW',
    url: 'https://play.geforcenow.com',
    color: '#1A6E2E',
    icon: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M6.5 15a4 4 0 0 1 .3-8 5.3 5.3 0 0 1 10-1.6A4.2 4.2 0 0 1 17.5 15h-11z"/><path d="M10.3 11.6v4.2l3.7-2.1-3.7-2.1z" fill="#1A6E2E"/></svg>'
  },
];

const START = 'berri://home';
const GAMES_PAGE = 'berri://g';
const AI_PAGE = 'berri://ai';
const MOVIES_PAGE = 'berri://movies';
const MUSIC_PAGE = 'berri://music';
const APPS_PAGE = 'berri://apps';
const CHAT_PAGE = 'berri://chat';
const HISTORY_PAGE = 'berri://history';
const SETTINGS_PAGE = 'berri://settings';

const INTERNAL_ROUTES = new Set([
  START,
  GAMES_PAGE,
  AI_PAGE,
  MOVIES_PAGE,
  MUSIC_PAGE,
  APPS_PAGE,
  CHAT_PAGE,
  HISTORY_PAGE,
  SETTINGS_PAGE
]);

/* ---------------- state ---------------- */
let bookmarks = loadJSON('berri_browser_bookmarks_v1', DEFAULT_BOOKMARKS);

let settings = {
  engine: 'duckduckgo',
  moviePopupBlocker: true,
  ...loadJSON('berri_browser_settings_v1', {})
};

if (typeof settings.moviePopupBlocker !== 'boolean') {
  settings.moviePopupBlocker = true;
}

let history = loadJSON('berri_browser_history_v1', []);
let tabs = [];
let activeId = null;
let tabSeq = 0;
let enteringTabId = null;

function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v || fallback;
  } catch (_) {
    return fallback;
  }
}

function saveBookmarks() {
  localStorage.setItem(
    'berri_browser_bookmarks_v1',
    JSON.stringify(bookmarks)
  );
}

function saveSettings() {
  localStorage.setItem(
    'berri_browser_settings_v1',
    JSON.stringify(settings)
  );
}

function saveHistory() {
  localStorage.setItem(
    'berri_browser_history_v1',
    JSON.stringify(history)
  );
}

function addHistoryEntry(url) {
  if (INTERNAL_ROUTES.has(url)) return;

  history.unshift({
    url,
    ts: Date.now()
  });

  if (history.length > 300) history.length = 300;
  saveHistory();
}

/* ---------------- helpers ---------------- */

function looksLikeUrl(text) {
  const t = text.trim();

  if (/^https?:\/\//i.test(t)) return true;

  if (
    /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(t) &&
    !t.includes(' ')
  ) {
    return true;
  }

  return false;
}

function toUrl(text) {
  const t = text.trim();

  if (/^https?:\/\//i.test(t)) return t;

  return 'https://' + t;
}

function faviconLetter(name) {
  return (name || '?')
    .trim()
    .charAt(0)
    .toUpperCase();
}

function faviconUrl(url) {
  try {
    return `https://www.google.com/s2/favicons?sz=64&domain=${
      new URL(url).hostname
    }`;
  } catch (_) {
    return '';
  }
}

/* ---------------- tab model ---------------- */

function newTab(url) {
  const id = 'bbt' + (++tabSeq);
  const u = url || START;

  const tab = {
    id,
    url: u,
    title: internalLabel(u) || u,
    hist: [u],
    histIdx: 0
  };

  tabs.push(tab);
  activeId = id;
  enteringTabId = id;

  renderAll();

  return tab;
}

function closeTab(id) {
  const idx = tabs.findIndex(t => t.id === id);

  if (idx === -1) return;

  const el = document.querySelector(
    `.bb-tab[data-id="${id}"]`
  );

  const doRemove = () => {
    const i = tabs.findIndex(t => t.id === id);

    if (i === -1) return;

    tabs.splice(i, 1);

    document
      .getElementById('page-' + id)
      ?.remove();

    if (tabs.length === 0) {
      newTab(START);
      return;
    }

    if (activeId === id) {
      activeId = tabs[Math.max(0, i - 1)].id;
    }

    renderAll();
  };

  if (el) {
    el.classList.add('bb-tab-closing');
    setTimeout(doRemove, 160);
  } else {
    doRemove();
  }
}

function activeTab() {
  return tabs.find(t => t.id === activeId);
}

function goTo(tab, url, pushHist) {
  if (
    !url ||
    url === 'undefined' ||
    url === '/undefined' ||
    String(url).includes('fromUrl=%2Fundefined')
  ) {
    url = START;
  }

  tab.url = url;
  tab.title = internalLabel(url) || url;

  if (pushHist !== false) {
    tab.hist = tab.hist.slice(
      0,
      tab.histIdx + 1
    );

    tab.hist.push(url);
    tab.histIdx = tab.hist.length - 1;
  }

  if (pushHist !== false) {
    addHistoryEntry(url);
  }

  renderPageContent(tab);
  renderTabstrip();
  renderNavState();

  if (tab.id === activeId) {
    document.getElementById(
      'bbAddrInput'
    ).value = url;
  }

  syncSidebarRoute();
}

window.berriNavigateInternal = function(url) {
  const tab = activeTab();

  if (tab) {
    goTo(
      tab,
      String(url || START).toLowerCase()
    );
  }
};

function internalLabel(url) {
  if (url === START) return 'Home';
  if (url === GAMES_PAGE) return 'Games';
  if (url === AI_PAGE) return 'Berri AI';
  if (url === MOVIES_PAGE) return 'Movies';
  if (url === MUSIC_PAGE) return 'Music';
  if (url === APPS_PAGE) return 'All Apps';
  if (url === CHAT_PAGE) return 'Chat';
  if (url === HISTORY_PAGE) return 'History';
  if (url === SETTINGS_PAGE) return 'Settings';

  return null;
}

function navigateInput(raw) {
  const tab = activeTab();

  const input = String(
    raw ?? ''
  ).trim();

  if (
    !tab ||
    !input ||
    input === 'undefined'
  ) {
    return;
  }

  const lowered = input.toLowerCase();

  const aliases = {
    'berri://games': GAMES_PAGE,
    'berri://game': GAMES_PAGE,
    'berri://assistant': AI_PAGE,
    'berri://movie': MOVIES_PAGE,
    'berri://songs': MUSIC_PAGE,
    'berri://bookmarks': APPS_PAGE,
    'berri://all': APPS_PAGE,

    'berri://messages': CHAT_PAGE,
    'berri://message': CHAT_PAGE,
    'berri://dm': CHAT_PAGE,

    'berri://setting': SETTINGS_PAGE
  };

  if (INTERNAL_ROUTES.has(lowered)) {
    goTo(tab, lowered);
    return;
  }

  if (aliases[lowered]) {
    goTo(tab, aliases[lowered]);
    return;
  }

  const engine =
    ENGINES[settings.engine] ||
    ENGINES.duckduckgo;

  const url =
    looksLikeUrl(input)
      ? toUrl(input)
      : engine.url(input);

  if (!isBrokenUrl(url)) {
    goTo(tab, url);
  }
}

/* ---------------- rendering ---------------- */

function syncSidebarRoute() {
  const route =
    activeTab()?.url || '';

  document
    .querySelectorAll(
      '.bb-side-route[data-route]'
    )
    .forEach(button => {
      button.classList.toggle(
        'active',
        button.dataset.route === route
      );
    });
}

function renderAll() {
  renderTabstrip();
  renderPages();
  renderNavState();

  const tab = activeTab();

  document.getElementById(
    'bbAddrInput'
  ).value = tab ? tab.url : '';

  syncSidebarRoute();
}

function renderTabstrip() {
  const strip =
    document.getElementById(
      'bbTabstrip'
    );

  strip.innerHTML = '';

  tabs.forEach(t => {
    const el =
      document.createElement('div');

    el.className =
      'bb-tab' +
      (t.id === activeId ? ' active' : '');

    el.dataset.id = t.id;
    el.draggable = true;

    const label =
      internalLabel(t.url) ||
      (t.title || t.url)
        .replace(/^https?:\/\//, '')
        .split('/')[0];

    el.innerHTML = `
      <span class="bb-tab-title">
        ${escapeHtml(label)}
      </span>
      <span class="bb-tab-close">✕</span>
    `;

    el.addEventListener(
      'click',
      e => {
        if (
          e.target.classList.contains(
            'bb-tab-close'
          )
        ) {
          closeTab(t.id);
          return;
        }

        activeId = t.id;
        renderAll();
      }
    );

    el.addEventListener(
      'mousedown',
      e => {
        if (e.button === 1) {
          e.preventDefault();
          closeTab(t.id);
        }
      }
    );

    el.addEventListener(
      'contextmenu',
      e => showTabContextMenu(e, t)
    );

    el.addEventListener(
      'dragstart',
      e => {
        e.dataTransfer.setData(
          'text/plain',
          t.id
        );

        el.classList.add(
          'dragging'
        );
      }
    );

    el.addEventListener(
      'dragend',
      () =>
        el.classList.remove(
          'dragging'
        )
    );

    el.addEventListener(
      'dragover',
      e => e.preventDefault()
    );

    el.addEventListener(
      'drop',
      e => {
        e.preventDefault();

        const draggedId =
          e.dataTransfer.getData(
            'text/plain'
          );

        if (
          !draggedId ||
          draggedId === t.id
        ) {
          return;
        }

        const fromIdx =
          tabs.findIndex(
            x => x.id === draggedId
          );

        const toIdx =
          tabs.findIndex(
            x => x.id === t.id
          );

        if (
          fromIdx === -1 ||
          toIdx === -1
        ) {
          return;
        }

        const [moved] =
          tabs.splice(fromIdx, 1);

        tabs.splice(
          toIdx,
          0,
          moved
        );

        renderTabstrip();
      }
    );

    if (t.id === enteringTabId) {
      el.classList.add(
        'bb-tab-entering'
      );

      requestAnimationFrame(
        () =>
          requestAnimationFrame(
            () => {
              el.classList.add(
                'bb-tab-enter-active'
              );

              el.classList.remove(
                'bb-tab-entering'
              );
            }
          )
      );
    }

    strip.appendChild(el);
  });

  enteringTabId = null;

  const plus =
    document.createElement('div');

  plus.className = 'bb-newtab';
  plus.textContent = '+';

  plus.addEventListener(
    'click',
    () => newTab(START)
  );

  strip.appendChild(plus);
}

function renderPages() {
  const pages =
    document.getElementById(
      'bbPages'
    );

  [...pages.children]
    .forEach(el => {
      const id =
        el.id.replace(
          'page-',
          ''
        );

      if (
        !tabs.find(
          t => t.id === id
        )
      ) {
        el.remove();
      }
    });

  tabs.forEach(t => {
    let page =
      document.getElementById(
        'page-' + t.id
      );

    if (!page) {
      page =
        document.createElement(
          'div'
        );

      page.className = 'bb-page';
      page.id = 'page-' + t.id;

      pages.appendChild(page);

      renderPageContent(t);
    }

    page.classList.toggle(
      'active',
      t.id === activeId
    );
  });
}

function renderPageContent(tab) {
  const page =
    document.getElementById(
      'page-' + tab.id
    );

  if (!page) return;

  page.innerHTML = '';

  if (tab.url === START) {
    mountContent(
      page,
      buildStartPage(tab)
    );
    return;
  }

  if (tab.url === GAMES_PAGE) {
    mountContent(
      page,
      buildGamesPage(tab)
    );
    return;
  }

  if (tab.url === AI_PAGE) {
    mountContent(
      page,
      buildAIPage()
    );
    return;
  }

  if (tab.url === MOVIES_PAGE) {
    mountContent(
      page,
      buildMoviesPage(tab)
    );
    return;
  }

  if (tab.url === MUSIC_PAGE) {
    mountContent(
      page,
      buildMusicPage(tab)
    );
    return;
  }

  if (tab.url === APPS_PAGE) {
    mountContent(
      page,
      buildAppsPage(tab)
    );
    return;
  }

  if (tab.url === CHAT_PAGE) {
    if (
      typeof window.buildBerriChatPage ===
      'function'
    ) {
      mountContent(
        page,
        window.buildBerriChatPage(tab)
      );
    } else {
      const unavailable =
        document.createElement(
          'div'
        );

      unavailable.className =
        'bb-blocked';

      unavailable.innerHTML =
        '<h3>Chat could not start</h3><p>The Berri Chat module did not load. Reload Berri and try again.</p>';

      mountContent(
        page,
        unavailable
      );
    }

    return;
  }

  if (tab.url === HISTORY_PAGE) {
    mountContent(
      page,
      buildHistoryPage(tab)
    );
    return;
  }

  if (tab.url === SETTINGS_PAGE) {
    mountContent(
      page,
      buildSettingsPage(tab)
    );
    return;
  }

  const iframe =
    document.createElement(
      'iframe'
    );

  iframe.className =
    'bb-scramjet-frame';

  iframe.setAttribute(
    'allow',
    'autoplay; encrypted-media; picture-in-picture; clipboard-read; clipboard-write; fullscreen'
  );

  mountContent(
    page,
    iframe
  );

  openThroughScramjet(
    tab,
    iframe
  ).catch(err => {
    console.error(
      'Scramjet failed:',
      err
    );

    page.innerHTML = '';

    const errorView =
      document.createElement(
        'div'
      );

    errorView.className =
      'bb-blocked';

    errorView.innerHTML = `
      <h3>Page could not load</h3>
      <p>${escapeHtml(tab.url)}</p>
      <p>${escapeHtml(err?.message || 'Unknown Scramjet error')}</p>
      <button class="bb-settings-btn" type="button">Try again</button>
    `;

    errorView
      .querySelector('button')
      .addEventListener(
        'click',
        () =>
          renderPageContent(tab)
      );

    page.appendChild(
      errorView
    );
  });
}

function mountContent(
  page,
  content
) {
  content.classList.add(
    'bb-content-enter'
  );

  content.style.height =
    '100%';

  page.appendChild(
    content
  );

  requestAnimationFrame(
    () =>
      requestAnimationFrame(
        () => {
          content.classList.add(
            'bb-content-enter-active'
          );
        }
      )
  );
}

async function openThroughScramjet(
  tab,
  iframe
) {
  const page =
    iframe.parentElement;

  const loader =
    createBerriLoader(page);

  showBerriLoader(loader);

  let loaderFinished = false;

  const finishLoading = () => {
    if (loaderFinished) return;

    loaderFinished = true;

    hideBerriLoader(loader);
  };

  try {
    const controller =
      await getScramjetController();

    const frame =
      controller.createFrame(
        iframe,
        {
          plugins:
            scramjetPluginsFor(tab),
        }
      );

    tab.scramjetFrame = frame;
    tab.frameElement = iframe;

    iframe.addEventListener(
      "load",
      () =>
        setTimeout(
          finishLoading,
          450
        ),
      { once: true }
    );

    await frame.go(tab.url);

    setTimeout(
      finishLoading,
      10000
    );
  } catch (error) {
    finishLoading();
    throw error;
  }
}

function buildStartPage(tab) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'bb-start';

  const shell =
    document.createElement(
      'div'
    );

  shell.className =
    'bb-home-shell';

  const logo =
    document.createElement(
      'div'
    );

  logo.className =
    'bb-logo';

  logo.innerHTML = `
    <img src="/icon.png" alt="Berri logo">
    <span>Berri</span>
  `;

  shell.appendChild(logo);

  const subtitle =
    document.createElement(
      'div'
    );

  subtitle.className =
    'bb-home-subtitle';

  subtitle.textContent =
    'your browser, your world';

  shell.appendChild(
    subtitle
  );

  const form =
    document.createElement(
      'form'
    );

  form.className =
    'bb-search-form';

  form.innerHTML = `
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.3-4.3"/>
    </svg>
    <input
      type="text"
      placeholder="Search for anything!"
      autocomplete="off"
    />
    <button
      type="submit"
      class="bb-search-go"
    >
      Go
    </button>
  `;

  form.addEventListener(
    'submit',
    event => {
      event.preventDefault();

      navigateInput(
        form
          .querySelector('input')
          .value
      );
    }
  );

  shell.appendChild(form);

  const tag =
    document.createElement(
      'div'
    );

  tag.className =
    'bb-engine-tag';

  tag.textContent =
    `Searching with ${
      ENGINES[settings.engine].label
    }`;

  shell.appendChild(tag);

  const routes = [
    [
      'Games',
      GAMES_PAGE,
      '/icons/gamepad.svg'
    ],
    [
      'AI',
      AI_PAGE,
      '/icons/sparkles.svg'
    ],
    [
      'Movies',
      MOVIES_PAGE,
      '/icons/film.svg'
    ],
    [
      'Music',
      MUSIC_PAGE,
      '/icons/music.svg'
    ],
    [
      'Add',
      START,
      '/icons/plus.svg'
    ],
    [
      'All Apps',
      APPS_PAGE,
      '/icons/grid.svg'
    ]
  ];

  const grid =
    document.createElement(
      'div'
    );

  grid.className =
    'bb-route-grid';

  routes.forEach(
    ([label, route, icon]) => {
      const button =
        document.createElement(
          'button'
        );

      button.type =
        'button';

      button.className =
        'bb-route-tile';

      button.innerHTML = `
        <span class="bb-route-icon">
          <img
            class="bb-real-icon"
            src="${icon}"
            alt=""
          >
        </span>
        <span class="bb-route-label">
          ${label}
        </span>
      `;

      button.addEventListener(
        'click',
        () => {
          if (label === 'Add') {
            openAddBookmark();
          } else {
            goTo(
              tab,
              route
            );
          }
        }
      );

      grid.appendChild(
        button
      );
    }
  );

  shell.appendChild(grid);

  const cards =
    document.createElement(
      'div'
    );

  cards.className =
    'bb-home-cards';

  cards.innerHTML = `
    <article class="bb-home-card">
      <div class="bb-home-card-top">
        <div class="bb-home-card-avatar">B</div>
        <div>
          <div class="bb-home-card-name">Berri</div>
          <div class="bb-home-card-role">Fast browser</div>
        </div>
      </div>
      <p>Search the web, open internal pages, and keep everything inside one browser.</p>
    </article>

    <article class="bb-home-card">
      <div class="bb-home-card-top">
        <div class="bb-home-card-avatar">G</div>
        <div>
          <div class="bb-home-card-name">Games</div>
          <div class="bb-home-card-role">berri://g</div>
        </div>
      </div>
      <p>Jump straight into the full Berri game library.</p>
    </article>

    <article class="bb-home-card">
      <div class="bb-home-card-top">
        <div class="bb-home-card-avatar">A</div>
        <div>
          <div class="bb-home-card-name">Berri AI</div>
          <div class="bb-home-card-role">berri://ai</div>
        </div>
      </div>
      <p>Ask questions, write, code, and create without leaving Berri.</p>
    </article>

    <article class="bb-home-card">
      <div class="bb-home-card-top">
        <div class="bb-home-card-avatar">M</div>
        <div>
          <div class="bb-home-card-name">Media</div>
          <div class="bb-home-card-role">Movies and music</div>
        </div>
      </div>
      <p>Your movie and music sections are ready to be connected.</p>
    </article>

    <article class="bb-home-card">
      <div class="bb-home-card-top">
        <div class="bb-home-card-avatar">S</div>
        <div>
          <div class="bb-home-card-name">Settings</div>
          <div class="bb-home-card-role">Make it yours</div>
        </div>
      </div>
      <p>Change the search engine and manage your browser preferences.</p>
    </article>
  `;

  shell.appendChild(cards);
  wrap.appendChild(shell);

  return wrap;
}

function buildBlockedView(url) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'bb-blocked';

  let host = url;

  try {
    host =
      new URL(url)
        .hostname
        .replace(/^www\./, '');
  } catch (_) {}

  wrap.innerHTML = `
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9"/>
      <path d="M4.9 4.9l14.2 14.2"/>
    </svg>

    <h3>
      ${escapeHtml(host)}
      can't be shown here
    </h3>

    <p>
      This site blocks itself from being embedded inside other apps,
      including in-app browsers like this one — it's a restriction the
      site sets, not something Berri Browser can get around.
    </p>

    <a
      href="${escapeAttr(url)}"
      target="_blank"
      rel="noopener"
    >
      Open in a new tab ↗
    </a>
  `;

  return wrap;
}

function buildAppsPage(tab) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'bb-apps-page';

  const header =
    document.createElement(
      'div'
    );

  header.className =
    'bb-apps-header';

  header.innerHTML = `
    <h2>All Apps</h2>
    <p>
      berri://apps — all of your saved
      bookmarks and shortcuts
    </p>
  `;

  wrap.appendChild(header);

  const grid =
    document.createElement(
      'div'
    );

  grid.className =
    'bb-apps-grid';

  bookmarks.forEach(
    (bookmark, index) => {
      const card =
        document.createElement(
          'button'
        );

      card.type =
        'button';

      card.className =
        'bb-app-card';

      const iconUrl =
        faviconUrl(
          bookmark.url
        );

      card.innerHTML = `
        <button
          class="bb-app-card-remove"
          type="button"
          title="Remove"
        >
          ✕
        </button>

        <span
          class="bb-app-card-icon"
          style="${
            bookmark.color
              ? `background:${bookmark.color}`
              : ''
          }"
        >
          <img
            src="${escapeAttr(iconUrl)}"
            alt=""
            onerror="
              this.style.display='none';
              this.parentElement.textContent='${
                escapeHtml(
                  faviconLetter(
                    bookmark.name
                  )
                )
              }'
            "
          >
        </span>

        <span class="bb-app-card-label">
          ${escapeHtml(bookmark.name)}
        </span>
      `;

      card.addEventListener(
        'click',
        event => {
          if (
            event.target
              .classList
              .contains(
                'bb-app-card-remove'
              )
          ) {
            event.stopPropagation();

            bookmarks.splice(
              index,
              1
            );

            saveBookmarks();
            renderPageContent(tab);

            return;
          }

          goTo(
            tab,
            bookmark.url
          );
        }
      );

      grid.appendChild(card);
    }
  );

  const add =
    document.createElement(
      'button'
    );

  add.type = 'button';

  add.className =
    'bb-app-card bb-app-card-add';

  add.innerHTML = `
    <span class="bb-app-card-icon">
      <img
        class="bb-real-icon"
        src="/icons/plus.svg"
        alt=""
      >
    </span>
    <span class="bb-app-card-label">
      Add Bookmark
    </span>
  `;

  add.addEventListener(
    'click',
    openAddBookmark
  );

  grid.appendChild(add);

  wrap.appendChild(grid);

  return wrap;
}

/* ---------------- Movies ---------------- */

const BERRI_CINEMETA_BASE =
  'https://v3-cinemeta.strem.io';

async function berriCinemeta(path) {
  const response =
    await fetch(
      `${BERRI_CINEMETA_BASE}${path}`
    );

  if (!response.ok) {
    throw new Error(
      `Movie catalog request failed (${response.status})`
    );
  }

  return response.json();
}

function berriMovieYear(movie) {
  return String(
    movie.releaseInfo ||
    movie.year ||
    movie.released ||
    ''
  ).slice(0, 4) ||
    'Unknown year';
}

function berriMoviePoster(movie) {
  return (
    movie.poster ||
    movie.background ||
    ''
  );
}

function berriMovieCard(
  movie,
  onOpen
) {
  const card =
    document.createElement(
      'button'
    );

  card.type =
    'button';

  card.className =
    'bb-movie-card';

  const poster =
    berriMoviePoster(movie);

  card.innerHTML = `
    ${
      poster
        ? `
          <img
            src="${escapeAttr(poster)}"
            alt="${escapeAttr(
              movie.name ||
              movie.title ||
              ''
            )} poster"
            loading="lazy"
          >
        `
        : `
          <div
            class="bb-movies-loading"
            style="aspect-ratio:2/3"
          >
            No poster
          </div>
        `
    }

    <span class="bb-movie-card-info">
      <span class="bb-movie-title">
        ${escapeHtml(
          movie.name ||
          movie.title ||
          'Untitled'
        )}
      </span>

      <span class="bb-movie-meta">
        ${escapeHtml(
          berriMovieYear(movie)
        )}
      </span>
    </span>
  `;

  card.addEventListener(
    'click',
    () => onOpen(movie)
  );

  return card;
}

function berriUniqueMovies(movies) {
  const seen = new Set();

  return (movies || [])
    .filter(movie => {
      const key =
        movie?.id ||
        `${
          movie?.name ||
          movie?.title ||
          ''
        }-${berriMovieYear(movie)}`;

      if (
        !key ||
        seen.has(key)
      ) {
        return false;
      }

      seen.add(key);

      return true;
    });
}

const BERRI_EMBED_SOURCES = [
  {
    id: 'vidsrc',
    label: 'Monkey',
    note: 'Source 1',
    url: id =>
      `https://vidsrc.to/embed/movie/${id}`,
    urlImdb: imdb =>
      `https://vidsrc.to/embed/movie/${imdb}`
  },
  {
    id: 'embedsu',
    label: 'Elk',
    note: 'Source 2',
    url: id =>
      `https://embed.su/embed/movie/${id}`,
    urlImdb: imdb =>
      `https://embed.su/embed/movie/${imdb}`
  },
  {
    id: 'vidsrcme',
    label: 'Tiger',
    note: 'Source 3',
    url: id =>
      `https://vidsrc.me/embed/movie?tmdb=${id}`,
    urlImdb: imdb =>
      `https://vidsrc.me/embed/movie?imdb=${imdb}`
  },
  {
    id: 'twoembed',
    label: 'Wolf',
    note: 'Source 4',
    url: id =>
      `https://www.2embed.cc/embed/${id}`,
    urlImdb: imdb =>
      `https://www.2embed.cc/embed/${imdb}`
  },
  {
    id: 'multiembed',
    label: 'Falcon',
    note: 'Source 5',
    url: id =>
      `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    urlImdb: imdb =>
      `https://multiembed.mov/directstream.php?video_id=${imdb}`
  },
  {
    id: 'autoembed',
    label: 'Panda',
    note: 'Source 6',
    url: id =>
      `https://autoembed.co/movie/tmdb/${id}`,
    urlImdb: imdb =>
      `https://autoembed.co/movie/imdb/${imdb}`
  },
  {
    id: 'vidsrcxyz',
    label: 'Lion',
    note: 'Source 7',
    url: id =>
      `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    urlImdb: imdb =>
      `https://vidsrc.xyz/embed/movie?imdb=${imdb}`
  },
  {
    id: 'vidlink',
    label: 'Otter',
    note: 'Source 8',
    url: id =>
      `https://vidlink.pro/movie/${id}`,
    urlImdb: imdb =>
      `https://vidlink.pro/movie/${imdb}`
  },
  {
    id: 'embedsoap',
    label: 'Cobra',
    note: 'Source 9',
    url: id =>
      `https://www.embedsoap.net/embed/movie/?id=${id}`,
    urlImdb: imdb =>
      `https://www.embedsoap.net/embed/movie/?id=${imdb}`
  },
  {
    id: 'smashystream',
    label: 'Shark',
    note: 'Source 10',
    url: id =>
      `https://player.smashystream.com/movie/${id}`,
    urlImdb: imdb =>
      `https://player.smashystream.com/movie/${imdb}`
  },
  {
    id: 'superembed',
    label: 'Fox',
    note: 'Source 11',
    url: id =>
      `https://superembed.stream/embed/movie?tmdb=${id}`,
    urlImdb: imdb =>
      `https://superembed.stream/embed/movie?imdb=${imdb}`
  },
  {
    id: 'moviesapi',
    label: 'Bear',
    note: 'Source 12',
    url: id =>
      `https://moviesapi.club/movie/${id}`,
    urlImdb: imdb =>
      `https://moviesapi.club/movie/${imdb}`
  }
];

function berriBuildSourcePanel(
  context
) {
  const {
    modalCard
  } = context;

  const dock =
    document.createElement(
      'section'
    );

  dock.className =
    'bb-player-bottom';

  dock.innerHTML = `
    <div class="bb-player-bottom-label">
      Sources
    </div>

    <div class="bb-source-dock-scroll">
      ${
        BERRI_EMBED_SOURCES.map(
          (source, index) => `
            <button
              type="button"
              class="bb-source-pill ${
                index === 0
                  ? 'active'
                  : ''
              }"
              data-source-id="${source.id}"
            >
              <span class="bb-source-pill-name">
                ${escapeHtml(source.label)}
              </span>
              <span class="bb-source-pill-note">
                ${escapeHtml(source.note)}
              </span>
            </button>
          `
        ).join('')
      }
    </div>

    <div class="bb-source-remember">
      <span>Remember</span>

      <button
        type="button"
        class="bb-source-toggle"
        aria-pressed="false"
      ></button>
    </div>
  `;

  const showSource =
    sourceId => {
      dock
        .querySelectorAll(
          '.bb-source-pill'
        )
        .forEach(item => {
          item.classList.toggle(
            'active',
            item.dataset.sourceId ===
              sourceId
          );
        });

      modalCard
        .querySelectorAll(
          '[data-source-view]'
        )
        .forEach(view => {
          const active =
            view.dataset.sourceView ===
            sourceId;

          view.hidden = !active;

          if (
            active &&
            !view.querySelector(
              'iframe'
            )
          ) {
            const src =
              view.dataset.embedSrc;

            if (src) {
              view.innerHTML = `
                <iframe
                  class="bb-movie-video"
                  src="${escapeAttr(src)}"
                  title="${escapeAttr(
                    sourceId
                  )} movie source"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowfullscreen
                  ${
                    settings.moviePopupBlocker
                      ? 'sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock"'
                      : ''
                  }
                  referrerpolicy="no-referrer"
                ></iframe>
              `;
            }
          }
        });

      if (
        dock
          .querySelector(
            '.bb-source-toggle'
          )
          ?.classList
          .contains('on')
      ) {
        localStorage.setItem(
          'berri_movie_last_source_v1',
          sourceId
        );
      }
    };

  dock
    .querySelectorAll(
      '.bb-source-pill'
    )
    .forEach(button => {
      button.addEventListener(
        'click',
        () =>
          showSource(
            button.dataset.sourceId
          )
      );
    });

  dock
    .querySelector(
      '.bb-source-toggle'
    )
    ?.addEventListener(
      'click',
      event => {
        const toggle =
          event.currentTarget;

        toggle.classList.toggle(
          'on'
        );

        toggle.setAttribute(
          'aria-pressed',
          toggle.classList.contains(
            'on'
          )
            ? 'true'
            : 'false'
        );
      }
    );

  const lastSource =
    localStorage.getItem(
      'berri_movie_last_source_v1'
    );

  const chosen =
    BERRI_EMBED_SOURCES.some(
      source =>
        source.id ===
        lastSource
    )
      ? lastSource
      : BERRI_EMBED_SOURCES[0].id;

  requestAnimationFrame(
    () => showSource(chosen)
  );

  return dock;
}

function buildMoviesPage(tab) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'bb-movies-page';

  wrap.innerHTML = `
    <section class="bb-movies-hero">
      <div class="bb-movies-hero-content">
        <div class="bb-movies-brand">
          Berri Movies
        </div>

        <h1>Find your next movie.</h1>

        <p>
          Search a large movie catalog with no API key,
          then open the animal source selector inside
          the movie player.
        </p>

        <div class="bb-movies-actions">
          <button
            type="button"
            class="bb-movie-btn primary"
            data-movie-search-focus
          >
            Search Movies
          </button>
        </div>
      </div>
    </section>

    <div class="bb-movies-toolbar">
      <form class="bb-movies-search">
        <span>⌕</span>

        <input
          type="search"
          placeholder="Search any movie title..."
          autocomplete="off"
        >
      </form>

      <button
        type="button"
        class="bb-movies-key-btn"
        data-home-catalog
      >
        Browse
      </button>
    </div>

    <main class="bb-movies-content"></main>

    <div
      class="bb-movie-modal"
      aria-hidden="true"
    >
      <div class="bb-movie-modal-card"></div>
    </div>
  `;

  const content =
    wrap.querySelector(
      '.bb-movies-content'
    );

  const searchForm =
    wrap.querySelector(
      '.bb-movies-search'
    );

  const searchInput =
    searchForm.querySelector(
      'input'
    );

  const modal =
    wrap.querySelector(
      '.bb-movie-modal'
    );

  const modalCard =
    wrap.querySelector(
      '.bb-movie-modal-card'
    );

  let restoreWindowOpen =
    null;

  const enableMoviePopupGuard =
    () => {
      if (
        !settings.moviePopupBlocker ||
        restoreWindowOpen
      ) {
        return;
      }

      const originalWindowOpen =
        window.open;

      window.open =
        function blockedMoviePopup() {
          return null;
        };

      restoreWindowOpen = () => {
        window.open =
          originalWindowOpen;

        restoreWindowOpen =
          null;
      };
    };

  const closeModal = () => {
    if (restoreWindowOpen) {
      restoreWindowOpen();
    }

    modal.classList.remove(
      'open'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    modalCard.innerHTML =
      '';
  };

  modal.addEventListener(
    'click',
    event => {
      if (event.target === modal) {
        closeModal();
      }
    }
  );

  const openMovie =
    async movie => {
      modal.classList.add(
        'open'
      );

      modal.setAttribute(
        'aria-hidden',
        'false'
      );

      enableMoviePopupGuard();

      modalCard.innerHTML =
        '<div class="bb-movies-loading">Loading movie…</div>';

      let details =
        movie;

      try {
        if (movie.id) {
          const result =
            await berriCinemeta(
              `/meta/movie/${
                encodeURIComponent(
                  movie.id
                )
              }.json`
            );

          details =
            result.meta ||
            movie;
        }
      } catch {
        details = movie;
      }

      const imdb =
        details.id ||
        movie.id ||
        '';

      const poster =
        details.background ||
        details.poster ||
        movie.poster ||
        '';

      const title =
        details.name ||
        movie.name ||
        'Movie';

      const year =
        berriMovieYear(
          details
        );

      const description =
        details.description ||
        'No description is available for this movie.';

      modalCard.innerHTML = `
        <section class="bb-player-shell">
          <header class="bb-player-top">
            <button
              type="button"
              class="bb-player-close bb-movie-close"
            >
              ←
            </button>

            <div class="bb-player-meta">
              <div class="bb-player-kicker">
                Movie
              </div>

              <div class="bb-player-heading">
                ${escapeHtml(title)}
              </div>

              <div class="bb-player-sub">
                ${escapeHtml(year)}
                ${
                  imdb
                    ? ` · ${escapeHtml(imdb)}`
                    : ''
                }
              </div>
            </div>
          </header>

          <section class="bb-player-stage">
            <div class="bb-player-screen">
              ${
                BERRI_EMBED_SOURCES.map(
                  source => `
                    <div
                      data-source-view="${source.id}"
                      data-embed-src="${escapeAttr(
                        source.urlImdb
                          ? source.urlImdb(imdb)
                          : source.url(imdb)
                      )}"
                      hidden
                    >
                      <div
                        class="bb-embed-placeholder"
                        style="
                          height:100%;
                          display:grid;
                          place-items:center;
                          color:#bca8b2;
                          font:600 12px var(--font-body)
                        "
                      >
                        Loading ${escapeHtml(source.label)}…
                      </div>
                    </div>
                  `
                ).join('')
              }
            </div>
          </section>

          <section class="bb-player-description">
            <p>
              ${escapeHtml(description)}
            </p>
          </section>
        </section>
      `;

      const sourcePanel =
        berriBuildSourcePanel({
          modalCard
        });

      const shell =
        modalCard.querySelector(
          '.bb-player-shell'
        );

      const desc =
        modalCard.querySelector(
          '.bb-player-description'
        );

      if (shell && desc) {
        shell.insertBefore(
          sourcePanel,
          desc
        );
      }

      modalCard
        .querySelector(
          '.bb-movie-close'
        )
        ?.addEventListener(
          'click',
          closeModal
        );
    };

  const renderRows =
    rows => {
      content.innerHTML = '';

      rows.forEach(
        ([title, movies]) => {
          const unique =
            berriUniqueMovies(
              movies
            );

          if (!unique.length) {
            return;
          }

          const section =
            document.createElement(
              'section'
            );

          section.className =
            'bb-movie-row';

          section.innerHTML = `
            <h2>
              ${escapeHtml(title)}
            </h2>

            <div class="bb-movies-count">
              ${unique.length} movies
            </div>
          `;

          const grid =
            document.createElement(
              'div'
            );

          grid.className =
            'bb-movie-grid';

          unique.forEach(
            movie => {
              grid.appendChild(
                berriMovieCard(
                  movie,
                  openMovie
                )
              );
            }
          );

          section.appendChild(
            grid
          );

          content.appendChild(
            section
          );
        }
      );

      if (
        !content.querySelector(
          '.bb-movie-row'
        )
      ) {
        content.innerHTML =
          '<div class="bb-movies-empty">No movies were found.</div>';
      }
    };

  const fetchCatalog =
    async extra => {
      const suffix =
        extra
          ? `/${extra}`
          : '';

      const result =
        await berriCinemeta(
          `/catalog/movie/top${suffix}.json`
        );

      return result.metas || [];
    };

  const renderHome =
    async () => {
      content.innerHTML =
        '<div class="bb-movies-loading">Loading the no-key movie catalog…</div>';

      try {
        const genres = [
          'Action',
          'Comedy',
          'Horror',
          'Sci-Fi',
          'Animation'
        ];

        const [
          top,
          ...genreRows
        ] =
          await Promise.all([
            fetchCatalog(''),

            ...genres.map(
              genre =>
                fetchCatalog(
                  `genre=${
                    encodeURIComponent(
                      genre
                    )
                  }`
                ).catch(
                  () => []
                )
            )
          ]);

        renderRows([
          [
            'Popular Movies',
            top
          ],

          ...genres.map(
            (genre, index) => [
              genre,
              genreRows[index]
            ]
          )
        ]);
      } catch (error) {
        content.innerHTML = `
          <div class="bb-movies-empty">
            The catalog could not load.
            <br>
            ${escapeHtml(error.message)}
          </div>
        `;
      }
    };

  searchForm.addEventListener(
    'submit',
    async event => {
      event.preventDefault();

      const query =
        searchInput.value.trim();

      if (!query) {
        renderHome();
        return;
      }

      content.innerHTML =
        '<div class="bb-movies-loading">Searching movies…</div>';

      try {
        const result =
          await berriCinemeta(
            `/catalog/movie/top/search=${
              encodeURIComponent(
                query
              )
            }.json`
          );

        renderRows([
          [
            `Results for "${query}"`,
            result.metas || []
          ]
        ]);
      } catch (error) {
        content.innerHTML = `
          <div class="bb-movies-empty">
            Search failed.
            <br>
            ${escapeHtml(error.message)}
          </div>
        `;
      }
    }
  );

  wrap
    .querySelector(
      '[data-movie-search-focus]'
    )
    ?.addEventListener(
      'click',
      () => {
        searchInput.focus();

        searchInput.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    );

  wrap
    .querySelector(
      '[data-home-catalog]'
    )
    ?.addEventListener(
      'click',
      renderHome
    );

  renderHome();

  return wrap;
}

function buildGamesPage(tab) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'bb-games-native-page';

  const gamesId =
    `bbNativeLuminGames-${tab.id}`;

  wrap.innerHTML = `
    <div class="bb-games-native-shell">
      <div
        id="${gamesId}"
        class="bb-games-native-host"
      >
        <div class="bb-route-loading">
          Loading games…
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(
    () => {
      const container =
        wrap.querySelector(
          `#${gamesId}`
        );

      if (
        typeof window.Lumin ===
        'undefined'
      ) {
        container.innerHTML =
          '<div class="bb-route-loading">The game library could not load. Check your internet connection.</div>';

        return;
      }

      const diceIcon = `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
          ></rect>

          <circle cx="9" cy="9" r="1" fill="currentColor"></circle>
          <circle cx="15" cy="9" r="1" fill="currentColor"></circle>
          <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
          <circle cx="9" cy="15" r="1" fill="currentColor"></circle>
          <circle cx="15" cy="15" r="1" fill="currentColor"></circle>
        </svg>
      `;

      const findGameCards =
        () => {
          const candidates = [
            ...container.querySelectorAll(
              'a, button, [role="button"]'
            )
          ]
            .filter(
              element =>
                element.querySelector(
                  'img'
                )
            )
            .filter(
              element => {
                const text =
                  (
                    element.textContent ||
                    ''
                  )
                    .trim()
                    .toLowerCase();

                return ![
                  'random',
                  'all',
                  'favorites',
                  'recent'
                ].includes(text);
              }
            );

          const cards = [];
          const seen = new Set();

          candidates.forEach(
            element => {
              const image =
                element.querySelector(
                  'img'
                );

              const identity =
                element.getAttribute(
                  'href'
                ) ||
                element.getAttribute(
                  'data-game-id'
                ) ||
                image?.getAttribute(
                  'src'
                ) ||
                image?.getAttribute(
                  'alt'
                );

              if (
                !identity ||
                seen.has(identity)
              ) {
                return;
              }

              seen.add(identity);
              cards.push(element);
            }
          );

          return cards;
        };

      const enhanceNativeUi =
        () => {
          const buttons = [
            ...container.querySelectorAll(
              'button'
            )
          ];

          const randomButton =
            buttons.find(
              button =>
                (
                  button.textContent ||
                  ''
                )
                  .trim()
                  .toLowerCase()
                  .includes('random')
            );

          if (
            randomButton &&
            randomButton.dataset
              .berriDice !== 'true'
          ) {
            randomButton.dataset
              .berriDice = 'true';

            randomButton.classList.add(
              'bb-native-random-dice'
            );

            const label =
              [
                ...randomButton
                  .childNodes
              ]
                .find(
                  node =>
                    node.nodeType ===
                      Node.TEXT_NODE &&
                    node.textContent.trim()
                )
                ?.textContent
                .trim() ||
              'Random';

            randomButton.innerHTML =
              `${diceIcon}<span>${escapeHtml(label)}</span>`;
          }

          const cards =
            findGameCards();

          const visible =
            cards.filter(
              card => {
                const style =
                  getComputedStyle(card);

                return (
                  style.display !==
                    'none' &&
                  style.visibility !==
                    'hidden' &&
                  card.getClientRects()
                    .length > 0
                );
              }
            );

          const toolbarCandidate =
            randomButton
              ?.parentElement ||
            container.querySelector(
              'header'
            ) ||
            container.firstElementChild;

          if (toolbarCandidate) {
            let count =
              toolbarCandidate
                .querySelector(
                  '.bb-native-games-count'
                );

            if (!count) {
              count =
                document.createElement(
                  'span'
                );

              count.className =
                'bb-native-games-count';

              toolbarCandidate
                .appendChild(count);
            }

            count.textContent =
              `${visible.length} of ${cards.length}`;
          }
        };

      try {
        container.innerHTML = '';

        const observer =
          new MutationObserver(
            () => {
              clearTimeout(
                container
                  ._berriNativeTimer
              );

              container
                ._berriNativeTimer =
                setTimeout(
                  enhanceNativeUi,
                  100
                );
            }
          );

        observer.observe(
          container,
          {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [
              'class',
              'style',
              'hidden'
            ]
          }
        );

        window.Lumin.init({
          container:
            `#${gamesId}`,
          theme: 'dark',
          columns: 8,
          gamesPerPage: 2000
        });

        setTimeout(
          enhanceNativeUi,
          400
        );

        setTimeout(
          enhanceNativeUi,
          1200
        );

        setTimeout(
          enhanceNativeUi,
          2600
        );
      } catch (error) {
        console.error(
          'Lumin failed:',
          error
        );

        container.innerHTML =
          '<div class="bb-route-loading">The game library had an error. Reload berri://g to try again.</div>';
      }
    }
  );

  return wrap;
}

function buildMusicPage(tab) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'bb-music-page';

  const frameId =
    `bbMusicFrame-${tab.id}`;

  wrap.innerHTML = `
    <header class="bb-music-header">
      <div class="bb-music-brand">
        <div class="bb-music-brand-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M9 18V5l10-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="16" cy="16" r="3"></circle>
          </svg>
        </div>

        <div>
          <h2>Berri Music</h2>
          <p>Full-song Monochrome test</p>
        </div>
      </div>

      <div class="bb-music-actions">
        <button
          type="button"
          class="bb-music-reload"
        >
          Reload
        </button>

        <button
          type="button"
          class="bb-music-open"
        >
          Open as Browser Tab
        </button>
      </div>
    </header>

    <div class="bb-music-notice">
      Monochrome is a third-party service.
      Availability, accounts, playback,
      advertisements, and song licensing
      are controlled by that service.
    </div>

    <section class="bb-music-frame-shell">
      <iframe
        id="${frameId}"
        class="bb-music-frame"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-read; clipboard-write"
        referrerpolicy="no-referrer"
      ></iframe>

      <div
        class="bb-music-error"
        hidden
      >
        <h3>
          Monochrome could not load
          inside the Music page
        </h3>

        <p>
          Open it as a regular Berri
          browser tab instead.
        </p>

        <button type="button">
          Open Monochrome
        </button>
      </div>
    </section>
  `;

  requestAnimationFrame(
    async () => {
      const iframe =
        wrap.querySelector(
          `#${frameId}`
        );

      const errorView =
        wrap.querySelector(
          '.bb-music-error'
        );

      const reloadButton =
        wrap.querySelector(
          '.bb-music-reload'
        );

      const openButton =
        wrap.querySelector(
          '.bb-music-open'
        );

      const errorOpenButton =
        errorView.querySelector(
          'button'
        );

      const openAsBrowserTab =
        () => {
          goTo(
            tab,
            'https://monochrome.tf'
          );
        };

      openButton.addEventListener(
        'click',
        openAsBrowserTab
      );

      errorOpenButton
        .addEventListener(
          'click',
          openAsBrowserTab
        );

      const loadMonochrome =
        async () => {
          errorView.hidden = true;
          iframe.hidden = false;

          const musicTab = {
            ...tab,
            url:
              'https://monochrome.tf',
            title:
              'Monochrome',
            hist: [
              'https://monochrome.tf'
            ],
            histIdx: 0
          };

          try {
            await openThroughScramjet(
              musicTab,
              iframe
            );
          } catch (error) {
            console.error(
              'Monochrome music test failed:',
              error
            );

            iframe.hidden =
              true;

            errorView.hidden =
              false;
          }
        };

      reloadButton
        .addEventListener(
          'click',
          () => {
            iframe.removeAttribute(
              'src'
            );

            loadMonochrome();
          }
        );

      loadMonochrome();
    }
  );

  return wrap;
}

function buildAIPage() {
  const frame =
    document.createElement(
      'iframe'
    );

  frame.className =
    'bb-ai-route-frame';

  frame.src =
    'https://berri-app-2-1.vercel.app/';

  frame.title =
    'Berri AI';

  frame.setAttribute(
    'allow',
    'clipboard-read; clipboard-write; microphone; camera; fullscreen'
  );

  return frame;
}

function buildPlaceholderPage(
  title,
  icon,
  message
) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'bb-internal-page';

  wrap.innerHTML = `
    <div class="bb-internal-header">
      <h2>
        ${escapeHtml(title)}
      </h2>
      <p>
        berri://${escapeHtml(
          title.toLowerCase()
        )}
      </p>
    </div>

    <div class="bb-placeholder">
      <div>
        <div class="bb-placeholder-icon">
          ${icon}
        </div>

        <h3>
          ${escapeHtml(title)}
        </h3>

        <p>
          ${escapeHtml(message)}
        </p>
      </div>
    </div>
  `;

  return wrap;
}

function buildHistoryPage(tab) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'bb-history';

  const head =
    document.createElement(
      'div'
    );

  head.className =
    'bb-history-head';

  head.innerHTML = `
    <h2>History</h2>
    <button
      class="bb-history-clear"
      id="bbHistClearInline"
    >
      Clear all
    </button>
  `;

  head
    .querySelector(
      '#bbHistClearInline'
    )
    .addEventListener(
      'click',
      () => {
        history = [];
        saveHistory();
        renderPageContent(tab);
      }
    );

  wrap.appendChild(head);

  if (history.length === 0) {
    const empty =
      document.createElement(
        'div'
      );

    empty.className =
      'bb-history-empty';

    empty.textContent =
      'Nothing here yet — sites you visit will show up in this list.';

    wrap.appendChild(
      empty
    );

    return wrap;
  }

  const list =
    document.createElement(
      'div'
    );

  list.className =
    'bb-history-list';

  history.forEach(
    entry => {
      const row =
        document.createElement(
          'div'
        );

      row.className =
        'bb-history-row';

      const time =
        new Date(entry.ts)
          .toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit'
            }
          );

      let host =
        entry.url;

      try {
        host =
          new URL(entry.url)
            .hostname
            .replace(/^www\./, '');
      } catch (_) {}

      row.innerHTML = `
        <span class="bb-history-time">
          ${escapeHtml(time)}
        </span>

        <div class="bb-history-info">
          <div class="bb-history-title">
            ${escapeHtml(host)}
          </div>

          <div class="bb-history-url">
            ${escapeHtml(entry.url)}
          </div>
        </div>
      `;

      row.addEventListener(
        'click',
        () =>
          goTo(
            tab,
            entry.url
          )
      );

      list.appendChild(row);
    }
  );

  wrap.appendChild(list);

  return wrap;
}

function buildSettingsPage(tab) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'bb-settings-page';

  const h2 =
    document.createElement(
      'h2'
    );

  h2.textContent =
    'Settings';

  wrap.appendChild(h2);

  const engineSection =
    document.createElement(
      'div'
    );

  engineSection.className =
    'bb-settings-section';

  engineSection.innerHTML =
    '<h4>Search engine</h4>';

  const engineList =
    document.createElement(
      'div'
    );

  Object.keys(
    ENGINES
  ).forEach(key => {
    const row =
      document.createElement(
        'label'
      );

    row.className =
      'bb-engine-opt';

    row.innerHTML = `
      <input
        type="radio"
        name="bbEngine"
        ${
          settings.engine === key
            ? 'checked'
            : ''
        }
      />
      ${escapeHtml(
        ENGINES[key].label
      )}
    `;

    row
      .querySelector(
        'input'
      )
      .addEventListener(
        'change',
        () => {
          settings.engine =
            key;

          saveSettings();

          const startTab =
            tabs.find(
              t =>
                t.url === START
            );

          if (startTab) {
            renderPageContent(
              startTab
            );
          }
        }
      );

    engineList.appendChild(
      row
    );
  });

  engineSection.appendChild(
    engineList
  );

  wrap.appendChild(
    engineSection
  );

  const movieSection =
    document.createElement(
      'div'
    );

  movieSection.className =
    'bb-settings-section';

  movieSection.innerHTML = `
    <h4>Movies</h4>

    <label class="bb-setting-toggle-row">
      <span>
        <strong>Pop-up blocker</strong>

        <small>
          Blocks movie players from opening
          extra tabs or pop-up windows.
        </small>
      </span>

      <button
        type="button"
        class="bb-setting-switch ${
          settings.moviePopupBlocker
            ? 'on'
            : ''
        }"
        aria-pressed="${
          settings.moviePopupBlocker
            ? 'true'
            : 'false'
        }"
      ></button>
    </label>

    <div class="bb-setting-status">
      Automatically ${
        settings.moviePopupBlocker
          ? 'ON'
          : 'OFF'
      }
    </div>
  `;

  const moviePopupSwitch =
    movieSection.querySelector(
      '.bb-setting-switch'
    );

  const moviePopupStatus =
    movieSection.querySelector(
      '.bb-setting-status'
    );

  moviePopupSwitch
    .addEventListener(
      'click',
      () => {
        settings.moviePopupBlocker =
          !settings.moviePopupBlocker;

        saveSettings();

        moviePopupSwitch
          .classList
          .toggle(
            'on',
            settings.moviePopupBlocker
          );

        moviePopupSwitch
          .setAttribute(
            'aria-pressed',
            settings.moviePopupBlocker
              ? 'true'
              : 'false'
          );

        moviePopupStatus
          .textContent =
          `Automatically ${
            settings.moviePopupBlocker
              ? 'ON'
              : 'OFF'
          }`;
      }
    );

  wrap.appendChild(
    movieSection
  );

  const dataSection =
    document.createElement(
      'div'
    );

  dataSection.className =
    'bb-settings-section';

  dataSection.innerHTML =
    '<h4>Data</h4>';

  const clearHistBtn =
    document.createElement(
      'button'
    );

  clearHistBtn.className =
    'bb-settings-btn';

  clearHistBtn.textContent =
    'Clear browsing history';

  clearHistBtn.addEventListener(
    'click',
    () => {
      history = [];

      saveHistory();

      const histTab =
        tabs.find(
          t =>
            t.url ===
            HISTORY_PAGE
        );

      if (histTab) {
        renderPageContent(
          histTab
        );
      }
    }
  );

  const resetBmBtn =
    document.createElement(
      'button'
    );

  resetBmBtn.className =
    'bb-settings-btn';

  resetBmBtn.textContent =
    'Reset bookmarks to default';

  resetBmBtn.addEventListener(
    'click',
    () => {
      bookmarks =
        JSON.parse(
          JSON.stringify(
            DEFAULT_BOOKMARKS
          )
        );

      saveBookmarks();

      const startTab =
        tabs.find(
          t =>
            t.url === START
        );

      if (startTab) {
        renderPageContent(
          startTab
        );
      }
    }
  );

  dataSection.appendChild(
    clearHistBtn
  );

  dataSection.appendChild(
    resetBmBtn
  );

  wrap.appendChild(
    dataSection
  );

  const shortcutsSection =
    document.createElement(
      'div'
    );

  shortcutsSection.className =
    'bb-settings-section';

  shortcutsSection.innerHTML = `
    <h4>Keyboard shortcuts</h4>

    <div class="bb-shortcuts-list">
      <div class="bb-shortcut-row">
        <span>New tab</span>
        <span class="bb-kbd">Alt+T</span>
      </div>

      <div class="bb-shortcut-row">
        <span>Close tab</span>
        <span class="bb-kbd">Alt+W</span>
      </div>

      <div class="bb-shortcut-row">
        <span>Duplicate tab</span>
        <span class="bb-kbd">Alt+D</span>
      </div>

      <div class="bb-shortcut-row">
        <span>Focus address bar</span>
        <span class="bb-kbd">/</span>
      </div>

      <div class="bb-shortcut-row">
        <span>Reload</span>
        <span class="bb-kbd">Alt+R</span>
      </div>

      <div class="bb-shortcut-row">
        <span>Switch to tab 1–9</span>
        <span class="bb-kbd">Alt+1–9</span>
      </div>

      <div class="bb-shortcut-row">
        <span>Next / previous tab</span>
        <span class="bb-kbd">Alt+]/[</span>
      </div>

      <div class="bb-shortcut-row">
        <span>Back / forward</span>
        <span class="bb-kbd">Alt+←/→</span>
      </div>

      <div class="bb-shortcut-row">
        <span>History</span>
        <span class="bb-kbd">Ctrl+Shift+H</span>
      </div>

      <div class="bb-shortcut-row">
        <span>Close popup / menu</span>
        <span class="bb-kbd">Esc</span>
      </div>
    </div>
  `;

  wrap.appendChild(
    shortcutsSection
  );

  return wrap;
}

function showTabContextMenu(
  e,
  tab
) {
  e.preventDefault();

  const menu =
    document.getElementById(
      'bbCtxMenu'
    );

  menu.innerHTML = '';

  const items = [
    {
      label: 'New tab',
      fn: () =>
        newTab(START)
    },
    {
      label: 'Duplicate tab',
      fn: () =>
        newTab(tab.url)
    },
    {
      label: 'Close tab',
      fn: () =>
        closeTab(tab.id)
    },
    {
      label: 'Close other tabs',
      fn: () => {
        tabs
          .filter(
            t =>
              t.id !== tab.id
          )
          .forEach(
            t =>
              document
                .getElementById(
                  'page-' + t.id
                )
                ?.remove()
          );

        tabs =
          tabs.filter(
            t =>
              t.id === tab.id
          );

        activeId =
          tab.id;

        renderAll();
      }
    }
  ];

  items.forEach(
    it => {
      const row =
        document.createElement(
          'div'
        );

      row.className =
        'bb-ctx-item';

      row.textContent =
        it.label;

      row.addEventListener(
        'click',
        () => {
          it.fn();
          hideCtxMenu();
        }
      );

      menu.appendChild(
        row
      );
    }
  );

  const x =
    Math.min(
      e.clientX,
      window.innerWidth - 190
    );

  const y =
    Math.min(
      e.clientY,
      window.innerHeight - 190
    );

  menu.style.left =
    x + 'px';

  menu.style.top =
    y + 'px';

  menu.classList.add(
    'open'
  );
}

function hideCtxMenu() {
  document
    .getElementById(
      'bbCtxMenu'
    )
    .classList.remove(
      'open'
    );
}

document.addEventListener(
  'click',
  hideCtxMenu
);

document.addEventListener(
  'scroll',
  hideCtxMenu,
  true
);

function renderNavState() {
  const tab =
    activeTab();

  document.getElementById(
    'bbBack'
  ).disabled =
    !tab ||
    tab.histIdx <= 0;

  document.getElementById(
    'bbFwd'
  ).disabled =
    !tab ||
    tab.histIdx >=
      tab.hist.length - 1;
}

function escapeHtml(s) {
  return (s || '')
    .replace(
      /[&<>"']/g,
      c =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[c])
    );
}

function escapeAttr(s) {
  return escapeHtml(s);
}

/* ---------------- bookmark modal ---------------- */

function openAddBookmark() {
  document.getElementById(
    'bbBmName'
  ).value = '';

  document.getElementById(
    'bbBmUrl'
  ).value = '';

  document.getElementById(
    'bbAddBmOverlay'
  ).classList.add(
    'open'
  );
}

function closeAddBookmark() {
  document.getElementById(
    'bbAddBmOverlay'
  ).classList.remove(
    'open'
  );
}

document
  .getElementById(
    'bbBmCancel'
  )
  .addEventListener(
    'click',
    closeAddBookmark
  );

document
  .getElementById(
    'bbAddBmOverlay'
  )
  .addEventListener(
    'click',
    e => {
      if (
        e.target.id ===
        'bbAddBmOverlay'
      ) {
        closeAddBookmark();
      }
    }
  );

document
  .getElementById(
    'bbBmSave'
  )
  .addEventListener(
    'click',
    () => {
      const name =
        document
          .getElementById(
            'bbBmName'
          )
          .value
          .trim();

      let url =
        document
          .getElementById(
            'bbBmUrl'
          )
          .value
          .trim();

      if (!name || !url) {
        return;
      }

      if (
        !/^https?:\/\//i.test(
          url
        )
      ) {
        url =
          'https://' + url;
      }

      bookmarks.push({
        name,
        url
      });

      saveBookmarks();
      closeAddBookmark();

      const tab =
        activeTab();

      if (
        tab &&
        tab.url === START
      ) {
        renderPageContent(
          tab
        );
      }
    }
  );

/* ---------------- nav bar wiring ---------------- */

document
  .getElementById(
    'bbAddrForm'
  )
  .addEventListener(
    'submit',
    e => {
      e.preventDefault();

      navigateInput(
        document
          .getElementById(
            'bbAddrInput'
          )
          .value
      );
    }
  );

document
  .getElementById(
    'bbBack'
  )
  .addEventListener(
    'click',
    () => {
      const tab =
        activeTab();

      if (
        !tab ||
        tab.histIdx <= 0
      ) {
        return;
      }

      tab.histIdx--;

      goTo(
        tab,
        tab.hist[
          tab.histIdx
        ],
        false
      );
    }
  );

document
  .getElementById(
    'bbFwd'
  )
  .addEventListener(
    'click',
    () => {
      const tab =
        activeTab();

      if (
        !tab ||
        tab.histIdx >=
          tab.hist.length - 1
      ) {
        return;
      }

      tab.histIdx++;

      goTo(
        tab,
        tab.hist[
          tab.histIdx
        ],
        false
      );
    }
  );

document
  .getElementById(
    'bbReload'
  )
  .addEventListener(
    'click',
    () => {
      const tab =
        activeTab();

      if (!tab) return;

      if (
        tab.scramjetFrame &&
        !internalLabel(
          tab.url
        )
      ) {
        tab.scramjetFrame
          .go(tab.url)
          .catch(
            () =>
              renderPageContent(
                tab
              )
          );
      } else {
        renderPageContent(
          tab
        );
      }
    }
  );

document
  .getElementById(
    'bbHome'
  )
  .addEventListener(
    'click',
    () => {
      const tab =
        activeTab();

      if (tab) {
        goTo(
          tab,
          START
        );
      }
    }
  );

document
  .getElementById(
    'bbHistoryBtn'
  )
  .addEventListener(
    'click',
    () => {
      const tab =
        activeTab();

      if (tab) {
        goTo(
          tab,
          HISTORY_PAGE
        );
      }
    }
  );

document
  .getElementById(
    'bbCloseApp'
  )
  .addEventListener(
    'click',
    () => {
      const tab =
        activeTab();

      if (tab) {
        goTo(
          tab,
          START
        );
      }
    }
  );

/* ---------------- settings ---------------- */

document
  .getElementById(
    'bbSettingsBtn'
  )
  .addEventListener(
    'click',
    () => {
      const tab =
        activeTab();

      if (tab) {
        goTo(
          tab,
          SETTINGS_PAGE
        );
      }
    }
  );

/* ---------------- keyboard shortcuts ---------------- */

document.addEventListener(
  'keydown',
  e => {
    const bmOpen =
      document
        .getElementById(
          'bbAddBmOverlay'
        )
        .classList
        .contains('open');

    const typing =
      /^(input|textarea)$/i
        .test(
          e.target.tagName ||
          ''
        );

    if (e.key === 'Escape') {
      if (bmOpen) {
        closeAddBookmark();
        return;
      }

      hideCtxMenu();
      return;
    }

    if (bmOpen) return;

    if (
      !typing &&
      e.key === '/'
    ) {
      e.preventDefault();

      const inp =
        document
          .getElementById(
            'bbAddrInput'
          );

      inp.focus();
      inp.select();

      return;
    }

    if (typing) {
      return;
    }

    if (
      e.ctrlKey &&
      e.shiftKey &&
      e.key.toLowerCase() ===
        'h'
    ) {
      e.preventDefault();

      const t =
        activeTab();

      if (t) {
        goTo(
          t,
          HISTORY_PAGE
        );
      }

      return;
    }

    if (
      e.altKey &&
      e.key.toLowerCase() ===
        't'
    ) {
      e.preventDefault();
      newTab(START);
      return;
    }

    if (
      e.altKey &&
      e.key.toLowerCase() ===
        'w'
    ) {
      e.preventDefault();

      if (activeId) {
        closeTab(
          activeId
        );
      }

      return;
    }

    if (
      e.altKey &&
      e.key.toLowerCase() ===
        'd'
    ) {
      e.preventDefault();

      const t =
        activeTab();

      if (t) {
        newTab(
          t.url
        );
      }

      return;
    }

    if (
      e.altKey &&
      e.key.toLowerCase() ===
        'r'
    ) {
      e.preventDefault();

      const t =
        activeTab();

      if (t) {
        renderPageContent(
          t
        );
      }

      return;
    }

    if (
      e.altKey &&
      /^[1-9]$/.test(
        e.key
      )
    ) {
      e.preventDefault();

      const idx =
        e.key === '9'
          ? tabs.length - 1
          : parseInt(
              e.key,
              10
            ) - 1;

      if (tabs[idx]) {
        activeId =
          tabs[idx].id;

        renderAll();
      }

      return;
    }

    if (
      e.altKey &&
      (
        e.key === ']' ||
        e.key === '['
      )
    ) {
      e.preventDefault();

      if (
        tabs.length < 2
      ) {
        return;
      }

      const curIdx =
        tabs.findIndex(
          t =>
            t.id ===
            activeId
        );

      const dir =
        e.key === ']'
          ? 1
          : -1;

      const nextIdx =
        (
          curIdx +
          dir +
          tabs.length
        ) %
        tabs.length;

      activeId =
        tabs[nextIdx].id;

      renderAll();

      return;
    }

    if (
      e.altKey &&
      e.key ===
        'ArrowLeft'
    ) {
      e.preventDefault();

      document
        .getElementById(
          'bbBack'
        )
        .click();

      return;
    }

    if (
      e.altKey &&
      e.key ===
        'ArrowRight'
    ) {
      e.preventDefault();

      document
        .getElementById(
          'bbFwd'
        )
        .click();

      return;
    }
  }
);

/* ---------------- init ---------------- */

const goto =
  new URL(
    location.href
  )
    .searchParams
    .get('goto');

const safeGoto =
  goto &&
  goto !==
    'undefined' &&
  goto !==
    '/undefined' &&
  !goto.includes(
    'fromUrl=%2Fundefined'
  );

if (safeGoto) {
  window.history.replaceState(
    null,
    '',
    location.pathname
  );

  newTab(goto);
} else {
  newTab(START);
}

document
  .querySelectorAll(
    '.bb-side-route[data-route]'
  )
  .forEach(
    button => {
      button.addEventListener(
        'click',
        () => {
          const tab =
            activeTab();

          if (!tab) {
            return;
          }

          goTo(
            tab,
            button.dataset.route
          );
        }
      );
    }
  );
