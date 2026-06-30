(function () {
  var data = window.__CHART_DATA__;
  if (!data || typeof Chart === "undefined") return;

  var charts = [];

  var CHART_I18N = {
    en: {
      submitted: "Submitted",
      resolved: "Resolved",
      grievances: "Grievances",
    },
    or: {
      submitted: "ଦାଖଲ",
      resolved: "ସମାଧାନ",
      grievances: "ଅଭିଯୋଗ",
    },
  };

  function uiLang() {
    return document.body.classList.contains("ui-lang-or") ? "or" : "en";
  }

  function t(key) {
    var pack = CHART_I18N[uiLang()] || CHART_I18N.en;
    return pack[key] || CHART_I18N.en[key] || key;
  }

  Chart.defaults.font.family = "'Noto Sans Oriya', 'Segoe UI', system-ui, sans-serif";
  Chart.defaults.color = "#64748b";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;

  var colors = {
    blue: "rgb(59, 130, 246)",
    blueSoft: "rgba(59, 130, 246, 0.12)",
    green: "rgb(22, 163, 74)",
    greenSoft: "rgba(22, 163, 74, 0.1)",
    saffron: "rgb(234, 88, 12)",
    navy: "rgb(30, 58, 95)",
    indigo: "rgb(99, 102, 241)",
    amber: "rgb(217, 119, 6)",
  };

  var palette = [
    colors.blue,
    colors.indigo,
    colors.saffron,
    colors.green,
    "rgb(220, 38, 38)",
    "rgb(100, 116, 139)",
    "rgb(14, 165, 233)",
    "rgb(168, 85, 247)",
  ];

  var grid = { color: "rgba(226, 232, 240, 0.8)", drawBorder: false };
  var baseScales = {
    x: { grid: grid, ticks: { font: { size: 11 } } },
    y: { grid: grid, ticks: { font: { size: 11 } }, beginAtZero: true },
  };

  function destroyCharts() {
    charts.forEach(function (c) {
      c.destroy();
    });
    charts = [];
  }

  function makeChart(id, config) {
    var el = document.getElementById(id);
    if (!el) return null;
    var chart = new Chart(el, config);
    charts.push(chart);
    return chart;
  }

  function buildCharts() {
    destroyCharts();

    if (data.trends && data.trends.labels.length) {
      makeChart("chart-trends", {
        type: "line",
        data: {
          labels: data.trends.labels,
          datasets: [
            {
              label: t("submitted"),
              data: data.trends.submitted,
              borderColor: colors.blue,
              backgroundColor: colors.blueSoft,
              fill: true,
              tension: 0.35,
              borderWidth: 2.5,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
            {
              label: t("resolved"),
              data: data.trends.resolved,
              borderColor: colors.green,
              backgroundColor: colors.greenSoft,
              fill: true,
              tension: 0.35,
              borderWidth: 2.5,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "bottom", labels: { padding: 16 } },
            tooltip: { backgroundColor: "#0f1b2d", padding: 10, cornerRadius: 8 },
          },
          scales: baseScales,
        },
      });
    }

    if (data.status && data.status.labels.length) {
      makeChart("chart-status", {
        type: "doughnut",
        data: {
          labels: data.status.labels,
          datasets: [{
            data: data.status.counts,
            backgroundColor: palette,
            borderWidth: 2,
            borderColor: "#fff",
            hoverOffset: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: {
            legend: { position: "bottom", labels: { padding: 12, font: { size: 11 } } },
          },
        },
      });
    }

    if (data.category && data.category.labels.length) {
      makeChart("chart-category", {
        type: "bar",
        data: {
          labels: data.category.labels,
          datasets: [{
            label: t("grievances"),
            data: data.category.counts,
            backgroundColor: colors.saffron,
            borderRadius: 6,
            maxBarThickness: 36,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: baseScales.x,
            y: baseScales.y,
          },
        },
      });
    }

    if (data.funnel && data.funnel.labels.length) {
      makeChart("chart-funnel", {
        type: "bar",
        data: {
          labels: data.funnel.labels,
          datasets: [{
            label: t("grievances"),
            data: data.funnel.counts,
            backgroundColor: function (ctx) {
              var chart = ctx.chart;
              var g = chart.ctx.createLinearGradient(0, 0, chart.width, 0);
              g.addColorStop(0, colors.navy);
              g.addColorStop(1, colors.indigo);
              return g;
            },
            borderRadius: 6,
            maxBarThickness: 28,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: baseScales.y,
            y: { grid: { display: false }, ticks: { font: { size: 10 } } },
          },
        },
      });
    }

    if (data.feedback && data.feedback.counts.some(function (c) { return c > 0; })) {
      makeChart("chart-feedback", {
        type: "bar",
        data: {
          labels: data.feedback.labels,
          datasets: [{
            data: data.feedback.counts,
            backgroundColor: [colors.amber, colors.saffron, colors.saffron, colors.green, colors.green],
            borderRadius: 6,
            maxBarThickness: 40,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: baseScales,
        },
      });
    }
  }

  buildCharts();

  document.addEventListener("ui-lang-change", function () {
    buildCharts();
  });

  var meter = document.getElementById("sla-meter-fill");
  if (meter) {
    var target = meter.getAttribute("data-width") || "0";
    meter.style.width = "0%";
    requestAnimationFrame(function () {
      setTimeout(function () {
        meter.style.width = target + "%";
      }, 300);
    });
  }

  document.querySelectorAll(".analytics-rank-fill").forEach(function (el, i) {
    var w = el.getAttribute("data-width") || "0";
    el.style.width = "0%";
    setTimeout(function () {
      el.style.width = w + "%";
    }, 400 + i * 80);
  });
})();
