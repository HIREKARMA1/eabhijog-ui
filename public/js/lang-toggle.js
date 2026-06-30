/** EN / Odia UI language toggle — shared across all pages */
(function () {
  var STORAGE_KEY = "abhijog-ui-lang";

  function getSavedLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return saved === "or" ? "or" : "en";
    } catch (e) {
      return "en";
    }
  }

  function applyLang(lang) {
    var isOr = lang === "or";
    document.body.classList.toggle("ui-lang-or", isOr);
    document.documentElement.lang = isOr ? "or" : "en";

    document.querySelectorAll(".lang-toggle-btn[data-ui-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-ui-lang") === lang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* ignore */ }

    var body = document.body;
    var titleEn = body.getAttribute("data-title-en");
    var titleOr = body.getAttribute("data-title-or");
    if (titleEn && titleOr) {
      document.title = isOr ? titleOr : titleEn;
    }

    document.querySelectorAll("option[data-i18n-en][data-i18n-or]").forEach(function (opt) {
      opt.textContent = isOr ? opt.getAttribute("data-i18n-or") : opt.getAttribute("data-i18n-en");
    });

    document.querySelectorAll("[data-placeholder-en][data-placeholder-or]").forEach(function (el) {
      el.placeholder = isOr ? el.getAttribute("data-placeholder-or") : el.getAttribute("data-placeholder-en");
    });

    document.dispatchEvent(new CustomEvent("ui-lang-change", { detail: { lang: lang } }));
  }

  function init() {
    var buttons = document.querySelectorAll(".lang-toggle-btn[data-ui-lang]");
    if (!buttons.length) return;

    applyLang(getSavedLang());

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-ui-lang") || "en");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
