/* ========================================================= */
/* WISHLIST PAGE JS                                          */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* ===================================================== */
    /* REMOVE WISHLIST ITEM                                  */
    /* ===================================================== */

    const removeButtons =
        document.querySelectorAll(
            ".wishlist-remove-btn"
        );


    removeButtons.forEach(button => {


        button.addEventListener(
            "click",
            async () => {


                const productId =
                    button.dataset.productId;


                if (!productId) {

                    console.error(
                        "Wishlist product ID missing."
                    );

                    return;

                }


                const item =
                    button.closest(
                        ".wishlist-item"
                    );


                /* ========================================= */
                /* DISABLE BUTTON                            */
                /* ========================================= */

                button.disabled = true;

                button.innerHTML =
                    "Removing...";


                try {


                    /* ===================================== */
                    /* SEND DELETE REQUEST                  */
                    /* ===================================== */

                    const response =
                        await fetch(
                            `/wishlist/remove/${productId}`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                }
                            }
                        );


                    const data =
                        await response.json()
                            .catch(() => null);


                    /* ===================================== */
                    /* SUCCESS                               */
                    /* ===================================== */

                    if (
                        response.ok &&
                        (
                            !data ||
                            data.success !== false
                        )
                    ) {


                        if (item) {

                            item.classList.add(
                                "removing"
                            );


                            setTimeout(() => {

                                item.remove();

                                updateWishlistCount();

                                checkEmptyWishlist();

                            }, 250);

                        }


                        return;

                    }


                    /* ===================================== */
                    /* ERROR                                 */
                    /* ===================================== */

                    console.error(
                        "Unable to remove wishlist item.",
                        data
                    );


                    button.disabled = false;

                    button.innerHTML =
                        '<span aria-hidden="true">♥</span> Remove';


                    alert(
                        "Unable to remove this product from your wishlist."
                    );


                } catch (error) {


                    console.error(
                        "Wishlist remove error:",
                        error
                    );


                    button.disabled = false;

                    button.innerHTML =
                        '<span aria-hidden="true">♥</span> Remove';


                    alert(
                        "Something went wrong. Please try again."
                    );

                }

            }
        );

    });



    /* ===================================================== */
    /* UPDATE WISHLIST COUNT                                */
    /* ===================================================== */

    function updateWishlistCount() {


        const countElement =
            document.querySelector(
                ".wishlist-count strong"
            );


        const labelElement =
            document.querySelector(
                ".wishlist-count span"
            );


        if (!countElement) {
            return;
        }


        const items =
            document.querySelectorAll(
                ".wishlist-item"
            );


        const count =
            items.length;


        countElement.textContent =
            count;


        if (labelElement) {

            labelElement.textContent =
                count === 1
                    ? "Item"
                    : "Items";

        }

    }



    /* ===================================================== */
    /* CHECK EMPTY STATE                                     */
    /* ===================================================== */

    function checkEmptyWishlist() {


        const grid =
            document.querySelector(
                "#wishlistGrid"
            );


        if (!grid) {
            return;
        }


        const items =
            grid.querySelectorAll(
                ".wishlist-item"
            );


        if (items.length > 0) {
            return;
        }


        /* ================================================ */
        /* RELOAD PAGE                                      */
        /* ================================================ */

        window.location.reload();

    }


});