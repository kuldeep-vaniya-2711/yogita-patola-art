/* ========================================================= */
/* ADMIN VISITORS JAVASCRIPT                                 */
/* ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ================================================= */
        /* ELEMENTS                                          */
        /* ================================================= */

        const searchInput =
            document.getElementById(
                "visitorSearch"
            );


        const clearSearchButton =
            document.getElementById(
                "clearVisitorSearch"
            );


        const visitorRows =
            document.querySelectorAll(
                ".visitor-row"
            );


        const searchEmpty =
            document.getElementById(
                "visitorSearchEmpty"
            );



        /* ================================================= */
        /* FILTER VISITORS                                   */
        /* ================================================= */

        function filterVisitors() {


            const searchValue =
                searchInput
                    ? searchInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            let visibleRows = 0;



            visitorRows.forEach(
                function (row) {


                    const searchableText =
                        row.dataset.search ||
                        "";


                    const shouldShow =
                        !searchValue ||
                        searchableText.includes(
                            searchValue
                        );


                    row.style.display =
                        shouldShow
                            ? ""
                            : "none";


                    if (shouldShow) {

                        visibleRows++;

                    }

                }
            );



            /* ============================================= */
            /* NO SEARCH RESULTS                             */
            /* ============================================= */

            if (searchEmpty) {

                searchEmpty.hidden =
                    visibleRows !== 0;

            }

        }



        /* ================================================= */
        /* SEARCH INPUT                                     */
        /* ================================================= */

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                filterVisitors
            );

        }



        /* ================================================= */
        /* CLEAR SEARCH                                      */
        /* ================================================= */

        if (clearSearchButton) {

            clearSearchButton.addEventListener(
                "click",
                function () {


                    if (searchInput) {

                        searchInput.value =
                            "";

                        searchInput.focus();

                    }


                    filterVisitors();

                }
            );

        }



        /* ================================================= */
        /* INITIAL FILTER                                    */
        /* ================================================= */

        filterVisitors();


    }
);