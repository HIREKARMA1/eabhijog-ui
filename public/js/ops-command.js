(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    document.body.classList.add("ops-no-motion");
  }

  function formatCount(num) {
    return num.toLocaleString("en-IN");
  }

  function animateCount(el) {
    var endRaw = el.getAttribute("data-count-end");
    if (!endRaw) return;

    var end = parseInt(endRaw.replace(/,/g, ""), 10);
    if (isNaN(end)) return;

    var suffix = el.getAttribute("data-count-suffix") || "";
    var duration = 1100;
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

  function initKpis() {
    document.querySelectorAll(".ops-kpi-value[data-count-end]").forEach(function (el) {
      if (reducedMotion) {
        var end = el.getAttribute("data-count-end");
        var suffix = el.getAttribute("data-count-suffix") || "";
        el.textContent = formatCount(parseInt(end, 10)) + suffix;
      } else {
        animateCount(el);
      }
    });
  }

  function initReveals() {
    var items = document.querySelectorAll(".ops-reveal");
    if (!items.length) return;

    if (reducedMotion) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
    );

    items.forEach(function (el, i) {
      el.style.transitionDelay = (i * 0.06) + "s";
      observer.observe(el);
    });
  }

  function initChatBubbles() {
    var bubbles = document.querySelectorAll(".ops-bubble-animate");
    if (!bubbles.length) return;

    if (reducedMotion) {
      bubbles.forEach(function (b) { b.classList.add("is-visible"); });
      return;
    }

    bubbles.forEach(function (b, i) {
      setTimeout(function () {
        b.classList.add("is-visible");
      }, 80 + i * 120);
    });
  }

  function initLifecycleConnectors() {
    var connectors = document.querySelectorAll(".lifecycle-connector-done");
    if (reducedMotion || !connectors.length) return;

    connectors.forEach(function (c, i) {
      c.style.setProperty("--delay", i * 0.15 + "s");
      c.querySelector("::after");
    });

    requestAnimationFrame(function () {
      connectors.forEach(function (c) {
        c.classList.add("lifecycle-connector-animated");
      });
    });
  }

  initKpis();
  initReveals();
  initChatBubbles();
  initLifecycleConnectors();
})();
