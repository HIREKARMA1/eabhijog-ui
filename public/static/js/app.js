/** Sidebar toggle (mobile + tablet) */
(function () {
  var toggle = document.getElementById("sidebar-toggle");
  var sidebar = document.getElementById("app-sidebar");
  var backdrop = document.getElementById("sidebar-backdrop");
  if (!toggle || !sidebar) return;

  function closeSidebar() {
    sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
  }
  function openSidebar() {
    sidebar.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
  }

  toggle.addEventListener("click", function () {
    if (sidebar.classList.contains("open")) closeSidebar();
    else openSidebar();
  });
  if (backdrop) backdrop.addEventListener("click", closeSidebar);
})();

/** Response templates */
(function () {
  document.querySelectorAll("[data-template]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var ta = document.getElementById("response_text");
      if (ta) ta.value = btn.getAttribute("data-template");
    });
  });
})();

/** Chart.js helpers */
(function () {
  var data = window.__CHART_DATA__;
  if (!data || typeof Chart === "undefined") return;
  if (document.body.classList.contains("analytics-page")) return;

  var colors = { blue: "rgb(37, 99, 235)", green: "rgb(22, 163, 74)", indigo: "rgb(79, 70, 229)", amber: "rgb(217, 119, 6)" };
  var palette = [colors.blue, colors.indigo, colors.amber, colors.green, "rgb(220, 38, 38)", "rgb(100, 116, 139)"];

  function makeChart(id, config) {
    var el = document.getElementById(id);
    if (el) new Chart(el, config);
  }

  if (data.trends && data.trends.labels.length) {
    makeChart("chart-trends", {
      type: "line",
      data: {
        labels: data.trends.labels,
        datasets: [
          { label: "Submitted", data: data.trends.submitted, borderColor: colors.blue, backgroundColor: "rgba(37,99,235,0.1)", fill: true, tension: 0.3 },
          { label: "Resolved", data: data.trends.resolved, borderColor: colors.green, backgroundColor: "rgba(22,163,74,0.08)", fill: true, tension: 0.3 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true } } },
    });
  }
  if (data.status && data.status.labels.length) {
    makeChart("chart-status", {
      type: "doughnut",
      data: { labels: data.status.labels, datasets: [{ data: data.status.counts, backgroundColor: palette }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
    });
  }
  if (data.funnel && data.funnel.labels.length) {
    makeChart("chart-funnel", {
      type: "bar",
      data: { labels: data.funnel.labels, datasets: [{ label: "Count", data: data.funnel.counts, backgroundColor: colors.indigo }] },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } },
    });
  }
  if (data.feedback && data.feedback.counts.some(function (c) { return c > 0; })) {
    makeChart("chart-feedback", {
      type: "bar",
      data: { labels: data.feedback.labels, datasets: [{ label: "Ratings", data: data.feedback.counts, backgroundColor: colors.amber }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
    });
  }
})();
