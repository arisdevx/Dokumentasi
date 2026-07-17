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

window.dokumentasi = function dokumentasi() {
  const search = createSearch(window.__DOKUMENTASI__?.search || []);
  const initialTheme = resolveInitialTheme();
  applyTheme(initialTheme);

  return {
    navOpen: false,
    searchOpen: false,
    searchQuery: "",
    theme: initialTheme,
    tryIt: createTryIt(window.__DOKUMENTASI__?.tryIt),

    get searchResults() {
      return search(this.searchQuery);
    },

    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      localStorage.setItem("dokumentasi-theme", this.theme);
      applyTheme(this.theme);
    }
  };
};
