/* =========================================================
   COLLECTIONS PAGE JS
   Yogita Patola Art
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =====================================================
           SEARCH
           ===================================================== */

        const searchForm =
            document.querySelector(
                ".collections-search-form"
            );

        const searchInput =
            document.querySelector(
                ".collections-search-form input[name='search']"
            );


        if (
            searchForm &&
            searchInput
        ) {

            searchForm.addEventListener(
                "submit",
                () => {

                    searchInput.value =
                        searchInput.value.trim();

                }
            );

        }


        /* =====================================================
           SORT
           ===================================================== */

        const sortSelect =
            document.querySelector(
                ".collections-sort-select"
            );


        const sortForm =
            document.querySelector(
                ".collections-sort-form"
            );


        if (
            sortSelect &&
            sortForm
        ) {

            sortSelect.addEventListener(
                "change",
                () => {

                    sortForm.submit();

                }
            );

        }


        /* =====================================================
           PRODUCT IMAGE FALLBACK
           ===================================================== */

        document
            .querySelectorAll(
                ".collections-product-grid img"
            )
            .forEach(image => {

                image.addEventListener(
                    "error",
                    () => {

                        image.style.display =
                            "none";

                    },
                    {
                        once: true
                    }
                );

            });

    }
);