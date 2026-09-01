/* ================================================= */
/* PRODUCTS PAGE JS                                  */
/* ================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* ================================================= */
    /* SEARCH                                             */
    /* ================================================= */

    const searchInput =
        document.querySelector(
            "#productSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    const form =
                        searchInput.closest("form");

                    if (form) {
                        form.submit();
                    }

                }

            }
        );

    }



    /* ================================================= */
    /* PRODUCT IMAGE ERROR                                */
    /* ================================================= */

    const productImages =
        document.querySelectorAll(
            ".products-grid img"
        );


    productImages.forEach((image) => {

        image.addEventListener(
            "error",
            () => {

                image.style.display = "none";

            }
        );

    });



    /* ================================================= */
    /* PRODUCT CARD HOVER                                */
    /* ================================================= */

    const productItems =
        document.querySelectorAll(
            ".product-grid-item"
        );


    productItems.forEach((item) => {

        item.addEventListener(
            "mouseenter",
            () => {

                item.classList.add(
                    "product-item-active"
                );

            }
        );


        item.addEventListener(
            "mouseleave",
            () => {

                item.classList.remove(
                    "product-item-active"
                );

            }
        );

    });

});