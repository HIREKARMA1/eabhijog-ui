(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    document.body.classList.add("landing-no-motion");
  }

  var cachedPortalData = null;
  var lastPortalSyncAt = null;
  var PORTAL_POLL_MS = 45000;

  var LANDING_I18N = {
    en: {
      closed: "Closed",
      noGrievances: "No grievances on record yet — be the first to file via WhatsApp.",
      deptEmpty: "Department statistics will appear as grievances are registered.",
      deptOpen: " open",
      syncJustNow: "updated just now",
      syncSecs: "updated {n}s ago",
      syncMins: "updated {n}m ago",
      deptTitle: function (cats, districts) {
        return cats + " ministerial desks, " + districts + " districts, one channel for the citizen.";
      },
    },
    or: {
      closed: "ବନ୍ଦ",
      noGrievances: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଅଭିଯୋଗ ନାହିଁ — WhatsApp ମାଧ୍ୟମରେ ପ୍ରଥମେ ଦାଖଲ କରନ୍ତୁ।",
      deptEmpty: "ଅଭିଯୋଗ ପଞ୍ଜିକରଣ ହେବା ସହ ବିଭାଗ ପରିସଂଖ୍ୟା ଦେଖାଯିବ।",
      deptOpen: " ଖୋଲା",
      syncJustNow: "ଏବେ ଅପଡେଟ୍",
      syncSecs: "{n} ସେକେଣ୍ଡ ପୂର୍ବେ",
      syncMins: "{n} ମିନିଟ ପୂର୍ବେ",
      deptTitle: function (cats, districts) {
        return cats + " ମନ୍ତ୍ରୀ ଡେସ୍କ, " + districts + " ଜିଲ୍ଲା — ନାଗରିକଙ୍କ ପାଇଁ ଗୋଟିଏ ଚ୍ୟାନେଲ।";
      },
    },
  };

  function uiLang() {
    return document.body.classList.contains("ui-lang-or") ? "or" : "en";
  }

  function t(key) {
    var pack = LANDING_I18N[uiLang()] || LANDING_I18N.en;
    return pack[key] || LANDING_I18N.en[key] || key;
  }

  /* Mobile nav */
  var toggle = document.getElementById("landing-nav-toggle");
  var menu = document.getElementById("landing-mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        menu.removeAttribute("hidden");
      } else {
        menu.setAttribute("hidden", "");
      }
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        menu.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Sticky nav shadow on scroll (Inmar-style) */
  var landingNav = document.getElementById("landing-nav");
  if (landingNav) {
    function updateNavScroll() {
      landingNav.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    updateNavScroll();
    window.addEventListener("scroll", updateNavScroll, { passive: true });
  }

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  });

  /* Scroll reveal */
  function revealOnScroll() {
    var items = document.querySelectorAll(".l-reveal, .l-reveal-right");
    if (!items.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
          setTimeout(function () {
            el.classList.add("is-visible");
          }, delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* Count-up for numeric stats */
  function formatCount(num) {
    return num.toLocaleString("en-IN");
  }

  function animateCount(el) {
    var endRaw = el.getAttribute("data-count-end");
    if (!endRaw) return;

    var end = parseInt(endRaw.replace(/,/g, ""), 10);
    if (isNaN(end)) return;

    var suffix = el.getAttribute("data-count-suffix") || "";
    var duration = 1400;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(end * eased);
      el.textContent = formatCount(current) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initCountUps(container) {
    container.querySelectorAll("[data-count-end]").forEach(animateCount);
    container.querySelectorAll("[data-count-text]").forEach(function (el) {
      el.textContent = el.getAttribute("data-count-text");
    });
  }

  /* WhatsApp chat sequence */
  function runChatSequence() {
    var mockup = document.getElementById("wa-mockup");
    var typing = document.getElementById("wa-typing");
    var footer = document.getElementById("wa-footer");
    var bubbles = Array.prototype.slice.call(
      document.querySelectorAll(".wa-bubble[data-chat-order]")
    );
    bubbles.sort(function (a, b) {
      return parseInt(a.getAttribute("data-chat-order"), 10) - parseInt(b.getAttribute("data-chat-order"), 10);
    });

    if (!mockup || !bubbles.length) return;

    function showTyping() {
      if (typing) {
        typing.classList.remove("wa-chat-hidden");
        typing.style.opacity = "1";
      }
    }

    function hideTyping() {
      if (typing) {
        typing.classList.add("wa-chat-hidden");
        typing.style.opacity = "0";
      }
    }

    function showBubble(bubble) {
      hideTyping();
      bubble.classList.remove("wa-chat-hidden");
      bubble.classList.add("wa-chat-visible");
    }

    function resetChat() {
      bubbles.forEach(function (b) {
        b.classList.add("wa-chat-hidden");
        b.classList.remove("wa-chat-visible");
      });
      if (footer) {
        footer.classList.add("wa-chat-hidden");
        footer.classList.remove("wa-chat-visible");
      }
      hideTyping();
    }

    if (reducedMotion) {
      bubbles.forEach(function (b) {
        b.classList.remove("wa-chat-hidden");
        b.classList.add("wa-chat-visible");
      });
      if (footer) footer.classList.remove("wa-chat-hidden");
      return;
    }

    var delays = [600, 1800, 3200, 4600, 6000];
    var typingBefore = [0, 1, 2, 3];

    function playOnce() {
      typingBefore.forEach(function (idx, i) {
        setTimeout(showTyping, delays[i] - 400);
        setTimeout(function () {
          showBubble(bubbles[idx]);
        }, delays[i]);
      });
      setTimeout(function () {
        if (footer) {
          footer.classList.remove("wa-chat-hidden");
          footer.classList.add("wa-chat-visible");
        }
      }, delays[4]);
    }

    playOnce();
    setInterval(function () {
      resetChat();
      setTimeout(playOnce, 500);
    }, 12000);
  }

  /* Hero stats count when hero is visible */
  function initHeroStats() {
    var heroStats = document.querySelector(".landing-mini-stats");
    if (!heroStats) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      initCountUps(heroStats);
      return;
    }

    var done = false;
    var obs = new IntersectionObserver(function (entries) {
      if (done || !entries[0].isIntersecting) return;
      done = true;
      setTimeout(function () {
        initCountUps(heroStats);
      }, 500);
      obs.disconnect();
    }, { threshold: 0.5 });
    obs.observe(heroStats);
  }

  /* Impact + dashboard counts on scroll */
  function initSectionCountUps() {
    var sections = ["#impact-banner", "#dashboard-preview"];
    sections.forEach(function (sel) {
      var section = document.querySelector(sel);
      if (!section) return;

      if (reducedMotion || !("IntersectionObserver" in window)) {
        initCountUps(section);
        return;
      }

      var done = false;
      var obs = new IntersectionObserver(function (entries) {
        if (done || !entries[0].isIntersecting) return;
        done = true;
        initCountUps(section);
        obs.disconnect();
      }, { threshold: 0.25 });
      obs.observe(section);
    });
  }

  function setCountText(id, value, suffix) {
    var el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("data-count-text", value);
    if (suffix !== undefined) {
      el.setAttribute("data-count-suffix", suffix);
    }
    el.textContent = value + (suffix || "");
  }

  function setCountEnd(id, value, suffix) {
    var el = document.getElementById(id);
    if (!el) return;
    var prev = el.textContent.replace(/,/g, "").replace(/%$/, "");
    var prevNum = parseInt(prev, 10);
    el.setAttribute("data-count-end", String(value));
    if (suffix !== undefined) {
      el.setAttribute("data-count-suffix", suffix);
    }
    if (!isNaN(prevNum) && prevNum !== value && !reducedMotion) {
      el.classList.remove("kpi-tick");
      void el.offsetWidth;
      el.classList.add("kpi-tick");
    }
    if (reducedMotion) {
      el.textContent = formatCount(value) + (suffix || "");
    } else {
      animateCount(el);
    }
  }

  function formatSyncAge() {
    if (!lastPortalSyncAt) return "";
    var secs = Math.floor((Date.now() - lastPortalSyncAt) / 1000);
    if (secs < 8) return t("syncJustNow");
    if (secs < 60) return t("syncSecs").replace("{n}", String(secs));
    return t("syncMins").replace("{n}", String(Math.floor(secs / 60)));
  }

  function updateSyncNote() {
    var timeEl = document.getElementById("preview-sync-time");
    if (!timeEl || !lastPortalSyncAt) return;
    timeEl.textContent = formatSyncAge();
  }

  function markPortalSynced(isRefresh) {
    lastPortalSyncAt = Date.now();
    updateSyncNote();
    var preview = document.getElementById("dashboard-preview");
    if (preview) {
      preview.classList.remove("is-syncing");
      if (isRefresh && !reducedMotion) {
        preview.classList.remove("preview-data-updated");
        void preview.offsetWidth;
        preview.classList.add("preview-data-updated");
      }
    }
  }

  function buildPreviewRowHtml(item) {
    var sla = item.is_closed
      ? '<span style="margin-left:auto;color:#16a34a;font-weight:700">' + t("closed") + "</span>"
      : item.is_overdue
        ? '<span class="preview-sla-red sla-pulse" style="margin-left:auto">' + item.sla_label + "</span>"
        : '<span style="margin-left:auto;color:#64748b">' + item.sla_label + "</span>";
    return (
      '<div class="preview-row-inner">' +
      "<strong>#" + item.reference_number + "</strong> " + item.citizen_label +
      ' <span class="preview-tag preview-tag-blue">' + item.district + "</span>" +
      ' <span class="preview-tag preview-tag-orange">' + item.category + "</span>" +
      sla +
      "</div>"
    );
  }

  function initPreviewScroll() {
    var viewport = document.getElementById("portal-preview-viewport");
    var track = document.getElementById("portal-preview-rows");
    if (!viewport || !track) return;

    track.querySelectorAll(".preview-row-clone").forEach(function (node) {
      node.remove();
    });
    viewport.classList.remove("preview-scroll-active");
    track.style.removeProperty("--preview-scroll-duration");

    var rows = track.querySelectorAll(".preview-row-inner");
    if (!rows.length || reducedMotion) return;

    rows.forEach(function (row) {
      var clone = row.cloneNode(true);
      clone.classList.add("preview-row-clone");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    var duration = Math.max(16, Math.min(40, rows.length * 3.5));
    track.style.setProperty("--preview-scroll-duration", duration + "s");
    viewport.classList.add("preview-scroll-active");
  }

  function renderPreviewRows(items) {
    var track = document.getElementById("portal-preview-rows");
    var viewport = document.getElementById("portal-preview-viewport");
    if (!track) return;
    if (!items || !items.length) {
      track.innerHTML = '<div class="preview-empty text-sm text-gray-500 py-4">' + t("noGrievances") + "</div>";
      if (viewport) viewport.classList.remove("preview-scroll-active");
      return;
    }
    track.innerHTML = items.map(buildPreviewRowHtml).join("");
    initPreviewScroll();
  }

  function renderDepartments(items, stats) {
    var grid = document.getElementById("portal-dept-grid");
    if (!grid) return;
    if (!items || !items.length) {
      grid.innerHTML = '<p class="text-sm text-gray-500">' + t("deptEmpty") + "</p>";
      return;
    }
    grid.innerHTML = items.map(function (dept, idx) {
      var path = dept.kind === "category" ? "/osd/" + dept.slug : dept.name;
      var count = dept.count ? " · " + dept.count : "";
      var open = dept.open_count
        ? '<div class="dept-open">' + dept.open_count + t("deptOpen") + "</div>"
        : "";
      return (
        '<div class="dept-cell l-reveal is-visible" data-delay="' + idx * 40 + '">' +
        '<div class="dept-api">' + path + count + "</div>" +
        '<div class="dept-name">' + dept.name + "</div>" +
        open +
        "</div>"
      );
    }).join("");

    if (stats) {
      var titleEl = document.querySelector("#departments .l-section-title");
      if (titleEl) {
        titleEl.innerHTML =
          '<span class="i18n-en">' + LANDING_I18N.en.deptTitle(stats.onboarded_categories, stats.district_count) + "</span>" +
          '<span class="i18n-or i18n-block" lang="or">' + LANDING_I18N.or.deptTitle(stats.onboarded_categories, stats.district_count) + "</span>";
      }
    }
  }

  function applyPortalData(data, isRefresh) {
    if (!data || !data.stats) return;
    cachedPortalData = data;
    var s = data.stats;
    setCountEnd("portal-kpi-overdue", s.sla_breached_open);
    setCountEnd("portal-kpi-active", s.open_count);
    setCountEnd("portal-kpi-resolved", s.closed_count);
    setCountEnd("portal-kpi-wa", s.whatsapp_sessions_7d);
    setCountEnd("portal-stat-districts", s.district_count);
    setCountText("portal-stat-median", s.median_reply_display);
    setCountEnd("portal-stat-resolution", Math.round(s.resolution_rate_pct), "%");
    setCountEnd("portal-impact-grievances", s.grievances_30d);
    if (s.sla_compliance_rate_pct != null) {
      setCountEnd("portal-impact-sla", Math.round(s.sla_compliance_rate_pct), "%");
    } else {
      setCountText("portal-impact-sla", "—");
    }
    setCountText("portal-impact-median", s.median_reply_display);
    setCountEnd("portal-impact-total", s.total_grievances);
    renderPreviewRows(data.recent_grievances);
    renderDepartments(data.departments, {
      onboarded_categories: s.onboarded_categories,
      district_count: s.district_count,
    });
    markPortalSynced(!!isRefresh);
  }

  function onLangChange() {
    updateSyncNote();
    if (cachedPortalData) {
      renderPreviewRows(cachedPortalData.recent_grievances);
      renderDepartments(cachedPortalData.departments, {
        onboarded_categories: cachedPortalData.stats.onboarded_categories,
        district_count: cachedPortalData.stats.district_count,
      });
    } else {
      initPreviewScroll();
    }
  }

  function refreshPortalFromApi(isRefresh) {
    var url = window.__PORTAL_API__ || "/api/public/portal";
    var preview = document.getElementById("dashboard-preview");
    if (preview && isRefresh) preview.classList.add("is-syncing");
    fetch(url, { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("portal fetch failed");
        return res.json();
      })
      .then(function (payload) {
        if (payload && payload.success && payload.data) {
          applyPortalData(payload.data, isRefresh);
        } else if (preview) {
          preview.classList.remove("is-syncing");
        }
      })
      .catch(function () {
        if (preview) preview.classList.remove("is-syncing");
      });
  }

  function startPortalPolling() {
    if (typeof document.hidden === "undefined") {
      setInterval(function () {
        refreshPortalFromApi(true);
      }, PORTAL_POLL_MS);
    } else {
      setInterval(function () {
        if (!document.hidden) refreshPortalFromApi(true);
      }, PORTAL_POLL_MS);
    }
    setInterval(updateSyncNote, 5000);
  }

  /* Hero entrance on load */
  function initHeroEntrance() {
    var heroItems = document.querySelectorAll(".landing-hero .l-reveal, .landing-hero .l-reveal-right");
    heroItems.forEach(function (el) {
      var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      setTimeout(function () {
        el.classList.add("is-visible");
      }, reducedMotion ? 0 : 100 + delay);
    });
  }

  revealOnScroll();
  initHeroEntrance();
  initHeroStats();
  initSectionCountUps();
  runChatSequence();
  initPreviewScroll();
  refreshPortalFromApi(false);
  startPortalPolling();

  document.addEventListener("ui-lang-change", onLangChange);
})();
