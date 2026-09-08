/* =========================================================
   YOGITA PATOLA ART - ADMIN DASHBOARD JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const visitorCanvas = document.getElementById("visitorChart");
    if (!visitorCanvas || typeof Chart === "undefined") return;

    const labels = (typeof visitorChartLabels !== "undefined" && Array.isArray(visitorChartLabels) && visitorChartLabels.length > 0)
        ? visitorChartLabels
        : ["No Data"];

    const data = (typeof visitorChartData !== "undefined" && Array.isArray(visitorChartData) && visitorChartData.length > 0)
        ? visitorChartData
        : [0];

    new Chart(visitorCanvas, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Visitors",
                data,
                tension: 0.35,
                fill: true,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
});