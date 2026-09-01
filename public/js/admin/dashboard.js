/* =========================================================
   YOGITA PATOLA ART
   ADMIN DASHBOARD JAVASCRIPT

   File:
   public/js/admin/dashboard.js

   Purpose:
   - Visitor chart
   - Dashboard UI behavior
   - Safe fallback when chart data is unavailable
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =================================================
           VISITOR CHART
           ================================================= */

        const visitorCanvas =
            document.getElementById(
                "visitorChart"
            );


        /*
         * Chart tabhi initialize hoga
         * jab canvas page par available ho.
         */

        if (!visitorCanvas) {
            return;
        }


        /*
         * Chart.js available hai ya nahi
         */

        if (
            typeof Chart === "undefined"
        ) {

            console.warn(
                "Chart.js is not loaded."
            );

            return;

        }


        /* =================================================
           DATA
           ================================================= */

        /*
         * Route se visitorChartLabels
         * aur visitorChartData pass kiya ja sakta hai.
         *
         * Example:
         *
         * visitorChartLabels:
         * ["Mon", "Tue", "Wed"]
         *
         * visitorChartData:
         * [12, 25, 18]
         */

        const labels =
            typeof visitorChartLabels !== "undefined" &&
            Array.isArray(visitorChartLabels)
                ? visitorChartLabels
                : [];


        const data =
            typeof visitorChartData !== "undefined" &&
            Array.isArray(visitorChartData)
                ? visitorChartData
                : [];


        /*
         * Agar route ne data nahi diya,
         * basic empty chart show hoga.
         */

        const finalLabels =
            labels.length > 0
                ? labels
                : [
                    "No Data"
                ];


        const finalData =
            data.length > 0
                ? data
                : [
                    0
                ];


        /* =================================================
           CREATE CHART
           ================================================= */

        new Chart(
            visitorCanvas,
            {

                type: "line",

                data: {

                    labels: finalLabels,

                    datasets: [

                        {

                            label:
                                "Visitors",

                            data:
                                finalData,

                            tension:
                                0.35,

                            fill:
                                true,

                            borderWidth:
                                2,

                            pointRadius:
                                3,

                            pointHoverRadius:
                                5

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    },


                    scales: {

                        x: {

                            grid: {

                                display:
                                    false

                            }

                        },


                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0

                            }

                        }

                    }

                }

            }
        );


    }
);