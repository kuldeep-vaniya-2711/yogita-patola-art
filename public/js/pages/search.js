/* =========================================================
   YOGITA PATOLA ART
   SEARCH PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        console.log(
            "Search page JS loaded."
        );



        /* =================================================
           SEARCH FORM
           ================================================= */

        const searchForm =
            document.getElementById(
                "searchForm"
            );


        const searchInput =
            document.getElementById(
                "searchInput"
            );



        /* =================================================
           SEARCH INPUT FOCUS
           ================================================= */

        if (searchInput) {

            searchInput.focus();

        }



        /* =================================================
           SEARCH FORM VALIDATION
           ================================================= */

        if (searchForm) {

            searchForm.addEventListener(
                "submit",
                function (event) {


                    if (!searchInput) {

                        return;

                    }


                    const searchValue =
                        searchInput.value.trim();


                    /*
                     * Empty search ko submit
                     * nahi karenge.
                     */

                    if (!searchValue) {

                        event.preventDefault();


                        searchInput.focus();


                        searchInput.classList.add(
                            "is-invalid"
                        );


                        return;

                    }


                    searchInput.classList.remove(
                        "is-invalid"
                    );


                    /*
                     * Trimmed value submit hogi.
                     */

                    searchInput.value =
                        searchValue;

                }
            );



            /* =============================================
               REMOVE ERROR WHILE TYPING
               ============================================= */

            if (searchInput) {

                searchInput.addEventListener(
                    "input",
                    function () {

                        this.classList.remove(
                            "is-invalid"
                        );

                    }
                );

            }

        }



        /* =================================================
           CLEAR SEARCH WITH ESC
           ================================================= */

        if (searchInput) {

            searchInput.addEventListener(
                "keydown",
                function (event) {


                    if (
                        event.key === "Escape"
                    ) {

                        this.value = "";

                        this.focus();

                    }

                }
            );

        }



        /* =================================================
           PRODUCT GRID ANIMATION
           ================================================= */

        const productItems =
            document.querySelectorAll(
                ".search-grid-item"
            );


        if (
            productItems.length > 0
        ) {


            productItems.forEach(
                function (item, index) {

                    item.style.opacity = "0";

                    item.style.transform =
                        "translateY(15px)";


                    setTimeout(
                        function () {

                            item.style.transition =
                                "opacity .35s ease, transform .35s ease";

                            item.style.opacity =
                                "1";

                            item.style.transform =
                                "translateY(0)";

                        },
                        index * 70
                    );

                }
            );

        }



        /* =================================================
           RESULT COUNT LOG
           ================================================= */

        const resultCount =
            document.querySelector(
                ".search-result-count strong"
            );


        if (resultCount) {

            console.log(
                "Search results:",
                resultCount.textContent.trim()
            );

        }



        /* =================================================
           FINAL LOG
           ================================================= */

        console.log(
            "Search page initialized successfully."
        );

    }
);