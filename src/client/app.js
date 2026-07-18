import { createSearch } from "./search.js";
import { createTryIt } from "./try-it.js";

function readStoredTheme() {
  return localStorage.getItem("dokumentasi-theme");
}

function resolveInitialTheme() {
  const stored = readStoredTheme();
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function readPageData(documentRoot = document) {
  const dataNode = documentRoot.querySelector("#dokumentasi-data");
  if (!dataNode) return window.__DOKUMENTASI__ || {};

  try {
    return JSON.parse(dataNode.textContent || "{}");
  } catch {
    return window.__DOKUMENTASI__ || {};
  }
}

function isPlainLeftClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isSamePageHashLink(url) {
  return url.origin === window.location.origin &&
    url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    Boolean(url.hash);
}

function shouldHandleLink(link, event) {
  if (!link || !isPlainLeftClick(event)) return false;
  if (link.target || link.hasAttribute("download")) return false;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (isSamePageHashLink(url)) return false;
  if (url.pathname.match(/\.[a-z0-9]+$/i) && !url.pathname.endsWith(".html")) return false;

  return true;
}

window.dokumentasi = function dokumentasi() {
  const initialData = readPageData();
  const initialTheme = resolveInitialTheme();
  applyTheme(initialTheme);

  return {
    navOpen: false,
    searchOpen: false,
    searchQuery: "",
    theme: initialTheme,
    search: createSearch(initialData.search || []),
    tryIt: createTryIt(initialData.tryIt),

    init() {
      document.addEventListener("click", (event) => this.handleNavigationClick(event));
      window.addEventListener("popstate", () => this.navigate(window.location.href, { push: false, restoreScroll: true }));
    },

    get searchResults() {
      return this.search(this.searchQuery);
    },

    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      localStorage.setItem("dokumentasi-theme", this.theme);
      applyTheme(this.theme);
    },

    async handleNavigationClick(event) {
      const link = event.target.closest("a[href]");
      if (!shouldHandleLink(link, event)) return;

      event.preventDefault();
      await this.navigate(link.href);
    },

    async navigate(url, options = {}) {
      const push = options.push !== false;

      try {
        const response = await fetch(url, {
          headers: { "X-Requested-With": "fetch" }
        });
        if (!response.ok) throw new Error(`Navigation failed with ${response.status}`);

        const html = await response.text();
        const nextDocument = new DOMParser().parseFromString(html, "text/html");
        const nextData = readPageData(nextDocument);
        const targets = {
          nav: document.querySelector("[data-docs-nav]"),
          grid: document.querySelector("[data-docs-grid]"),
          content: document.querySelector("[data-docs-content]"),
          tryIt: document.querySelector("[data-docs-try-it]"),
          scroll: document.querySelector("[data-docs-scroll]")
        };
        const nextTargets = {
          nav: nextDocument.querySelector("[data-docs-nav]"),
          grid: nextDocument.querySelector("[data-docs-grid]"),
          content: nextDocument.querySelector("[data-docs-content]"),
          tryIt: nextDocument.querySelector("[data-docs-try-it]")
        };

        if (Object.values(targets).some((item) => !item) || Object.values(nextTargets).some((item) => !item)) {
          throw new Error("Navigation targets are missing");
        }

        this.tryIt = createTryIt(nextData.tryIt);
        this.search = createSearch(nextData.search || []);
        this.searchOpen = false;
        this.searchQuery = "";
        this.navOpen = false;
        window.__DOKUMENTASI__ = nextData;

        window.Alpine?.destroyTree?.(targets.nav);
        window.Alpine?.destroyTree?.(targets.content);
        window.Alpine?.destroyTree?.(targets.tryIt);

        targets.nav.innerHTML = nextTargets.nav.innerHTML;
        targets.grid.className = nextTargets.grid.className;
        targets.content.className = nextTargets.content.className;
        targets.content.innerHTML = nextTargets.content.innerHTML;
        targets.tryIt.className = nextTargets.tryIt.className;
        targets.tryIt.innerHTML = nextTargets.tryIt.innerHTML;

        document.title = nextDocument.title;
        const description = nextDocument.querySelector("meta[name='description']")?.getAttribute("content");
        if (description) document.querySelector("meta[name='description']")?.setAttribute("content", description);

        if (push) history.pushState({}, "", url);
        if (!options.restoreScroll) targets.scroll.scrollTo({ top: 0 });

        window.Alpine?.initTree(targets.nav);
        window.Alpine?.initTree(targets.content);
        window.Alpine?.initTree(targets.tryIt);
      } catch {
        window.location.href = url;
      }
    }
  };
};
