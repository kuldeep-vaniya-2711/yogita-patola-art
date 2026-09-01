/* ================================================= */
/* COLLECTIONS PAGE JS                              */
/* ================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const searchInput =
        document.querySelector(
            ".collections-search-form input[name='search']"
        );


    const categorySelect =
        document.querySelector(
            ".collections-category-form select[name='category']"
        );


    /* ================================================= */
    /* SEARCH INPUT                                      */
    /* ================================================= */

    if (searchInput) {

        searchInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                const form =
                    searchInput.closest("form");

                if (form) {
                    form.submit();
                }

            }

        });

    }


    /* ================================================= */
    /* CATEGORY FILTER                                   */
    /* ================================================= */

    if (categorySelect) {

        categorySelect.addEventListener("change", () => {

            const form =
                categorySelect.closest("form");

            if (form) {
                form.submit();
            }

        });

    }


    /* ================================================= */
    /* PRODUCT IMAGE ERROR                               */
    /* ================================================= */

    const productImages =
        document.querySelectorAll(
            ".collections-product-grid img"
        );


    productImages.forEach((image) => {

        image.addEventListener("error", () => {

            image.style.display = "none";

        });

    });

});