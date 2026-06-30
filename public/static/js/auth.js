(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    document.body.classList.add("auth-no-motion");
  }

  /* Password toggle */
  function bindPasswordToggle(toggleId, inputId) {
    var toggle = document.getElementById(toggleId);
    var input = document.getElementById(inputId);
    if (!toggle || !input) return;
    toggle.addEventListener("click", function () {
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      toggle.classList.toggle("is-visible", show);
      toggle.setAttribute("aria-pressed", show ? "true" : "false");
      toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  }

  bindPasswordToggle("auth-toggle-password", "password");
  bindPasswordToggle("auth-toggle-password-confirm", "password_confirm");

  /* SSO mailto */
  var ssoBtn = document.getElementById("auth-sso-btn");
  if (ssoBtn) {
    ssoBtn.addEventListener("click", function () {
      window.location.href = "mailto:support@abhijog.odisha.gov.in?subject=Government%20SSO%20Access%20Request";
    });
  }

  /* Reset form — live password match hint */
  var resetForm = document.getElementById("auth-reset-form");
  var pwdInput = document.getElementById("password");
  var confirmInput = document.getElementById("password_confirm");
  var matchHint = document.getElementById("auth-password-match-hint");

  function updatePasswordMatchHint() {
    if (!matchHint || !pwdInput || !confirmInput) return;
    if (!confirmInput.value) {
      matchHint.hidden = true;
      return;
    }
    if (pwdInput.value === confirmInput.value) {
      matchHint.hidden = true;
      confirmInput.setCustomValidity("");
      return;
    }
    matchHint.hidden = false;
    matchHint.textContent = document.body.classList.contains("ui-lang-or")
      ? "ପାସୱାର୍ଡ ମେଳ ଖାଉନାହିଁ"
      : "Passwords do not match";
    matchHint.className = "auth-field-hint auth-field-hint-error";
  }

  if (pwdInput && confirmInput) {
    pwdInput.addEventListener("input", updatePasswordMatchHint);
    confirmInput.addEventListener("input", updatePasswordMatchHint);
  }

  if (resetForm && pwdInput && confirmInput) {
    resetForm.addEventListener("submit", function (event) {
      updatePasswordMatchHint();
      if (pwdInput.value !== confirmInput.value) {
        event.preventDefault();
        confirmInput.setCustomValidity("Passwords do not match");
        confirmInput.reportValidity();
      }
    });
  }

  /* Submit loading state */
  ["auth-login-form", "auth-forgot-form", "auth-reset-form", "auth-access-form"].forEach(function (formId) {
    var form = document.getElementById(formId);
    var btn = form && form.querySelector("#auth-submit-btn");
    if (!form || !btn) return;
    form.addEventListener("submit", function () {
      btn.classList.add("is-loading");
    });
  });

  /* Count-up stats */
  function formatCount(num) {
    return num.toLocaleString("en-IN");
  }

  function animateCount(el) {
    var endRaw = el.getAttribute("data-count-end");
    if (!endRaw) return;

    var end = parseInt(endRaw.replace(/,/g, ""), 10);
    if (isNaN(end)) return;

    var suffix = el.getAttribute("data-count-suffix") || "";
    var duration = 1200;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCount(Math.round(end * eased)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initStats() {
    document.querySelectorAll(".auth-panel [data-count-end]").forEach(animateCount);
    document.querySelectorAll(".auth-panel [data-count-text]").forEach(function (el) {
      var text = el.getAttribute("data-count-text");
      if (text) el.textContent = text;
    });
  }

  function applyAuthStats(data) {
    if (!data) return;
    var districts = document.getElementById("auth-stat-districts");
    var median = document.getElementById("auth-stat-median");
    var resolved = document.getElementById("auth-stat-resolved");
    if (districts) {
      districts.setAttribute("data-count-end", String(data.active_district_count));
      animateCount(districts);
    }
    if (median) {
      median.setAttribute("data-count-text", data.median_reply_display);
      median.textContent = data.median_reply_display;
    }
    if (resolved) {
      resolved.setAttribute("data-count-end", String(data.closed_count));
      animateCount(resolved);
    }
    var districtFoot = document.querySelector("#auth-panel-stats .auth-stat-foot");
    var resolvedFoot = document.querySelectorAll("#auth-panel-stats .auth-stat-foot")[1];
    if (districtFoot) {
      districtFoot.dataset.countEn = "of " + data.district_count + " in Odisha";
      districtFoot.dataset.countOr = data.district_count + " ର " + data.active_district_count + " ଜିଲ୍ଲା";
      if (!document.body.classList.contains("ui-lang-or")) {
        districtFoot.textContent = districtFoot.dataset.countEn;
      }
    }
    if (resolvedFoot) {
      resolvedFoot.dataset.countEn = Math.round(data.resolution_rate_pct) + "% rate";
      resolvedFoot.dataset.countOr = Math.round(data.resolution_rate_pct) + "% ହାର";
      if (!document.body.classList.contains("ui-lang-or")) {
        resolvedFoot.textContent = resolvedFoot.dataset.countEn;
      }
    }
  }

  function refreshAuthStats() {
    fetch("/api/public/stats", { headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("stats fetch failed");
        return res.json();
      })
      .then(function (payload) {
        if (payload && payload.success && payload.data) {
          applyAuthStats(payload.data);
        }
      })
      .catch(function () { /* SSR values remain */ });
  }

  /* Staggered entrance */
  function initEntrance() {
    var left = document.querySelectorAll(".auth-anim");
    var right = document.querySelectorAll(".auth-anim-right");

    if (reducedMotion) {
      left.forEach(function (el) { el.classList.add("is-visible"); });
      right.forEach(function (el) { el.classList.add("is-visible"); });
      initStats();
      return;
    }

    left.forEach(function (el) {
      var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      setTimeout(function () {
        el.classList.add("is-visible");
        if (el.classList.contains("auth-panel-stats")) {
          setTimeout(initStats, 200);
        }
      }, 200 + delay);
    });

    right.forEach(function (el) {
      var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      setTimeout(function () {
        el.classList.add("is-visible");
      }, 350 + delay);
    });
  }

  initEntrance();
  refreshAuthStats();
})();
