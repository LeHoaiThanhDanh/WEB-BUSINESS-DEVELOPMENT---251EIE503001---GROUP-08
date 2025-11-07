(() => {
  const STORAGE_KEY = "app.lang";
  const SUPPORTED = ["vi", "en"];
  const LANG_PATH = (code) => `/public/lang/${code}.json`;

  // Load JSON file
  async function loadDict(lang) {
    const res = await fetch(LANG_PATH(lang), { cache: "no-store" });
    if (!res.ok) throw new Error("Cannot load language file: " + lang);
    return res.json();
  }

  // Apply translations
  function applyI18n(dict, lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const val = dict[key];
      if (val) el.innerHTML = val;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const val = dict[key];
      if (val) el.setAttribute("placeholder", val);
    });
    document.title = dict["title"] || document.title;
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.removeAttribute("aria-pressed");
      if (b.dataset.lang === lang) b.setAttribute("aria-pressed", "true");
    });
  }

  // Detect language
  function detectLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (SUPPORTED.includes(q)) return q;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(saved)) return saved;
    const nav = navigator.language?.slice(0, 2);
    return SUPPORTED.includes(nav) ? nav : "vi";
  }

  async function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = "vi";
    localStorage.setItem(STORAGE_KEY, lang);
    const dict = await loadDict(lang);
    applyI18n(dict, lang);
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState({}, "", url);
  }

  // Init
  (async function init() {
    const lang = detectLang();
    const dict = await loadDict(lang);
    applyI18n(dict, lang);
    document.querySelectorAll(".lang-btn").forEach((btn) =>
      btn.addEventListener("click", () => setLang(btn.dataset.lang))
    );
  })();
})();
