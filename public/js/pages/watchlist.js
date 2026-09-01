/* ========================================================= */
/* WATCHLIST PAGE JS                                         */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* ===================================================== */
    /* REMOVE BUTTONS                                        */
    /* ===================================================== */

    const removeButtons =
        document.querySelectorAll(
            ".watchlist-remove-btn"
        );


    removeButtons.forEach(button => {


        button.addEventListener(
            "click",
            async () => {


                const productId =
                    button.dataset.productId;


                if (!productId) {

                    console.error(
                        "Watchlist product ID missing."
                    );

                    return;

                }


                const item =
                    button.closest(
                        ".watchlist-item"
                    );


                /* ========================================= */
                /* DISABLE BUTTON                            */
                /* ========================================= */

                button.disabled = true;

                button.innerHTML =
                    "Removing...";


                try {


                    /* ===================================== */
                    /* REQUEST                               */
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

                                updateWatchlistCount();

                                checkEmptyWatchlist();

                            }, 250);

                        }


                        return;

                    }


                    /* ===================================== */
                    /* ERROR                                 */
                    /* ===================================== */

                    console.error(
                        "Unable to remove watchlist item.",
                        data
                    );


                    resetButton(button);


                    alert(
                        "Unable to remove this product."
                    );


                } catch (error) {


                    console.error(
                        "Watchlist remove error:",
                        error
                    );


                    resetButton(button);


                    alert(
                        "Something went wrong. Please try again."
                    );

                }

            }
        );

    });



    /* ===================================================== */
    /* RESET BUTTON                                           */
    /* ===================================================== */

    function resetButton(button) {

        button.disabled = false;

        button.innerHTML =
            '<span aria-hidden="true">×</span> Remove';

    }



    /* ===================================================== */
    /* UPDATE COUNT                                           */
    /* ===================================================== */

    function updateWatchlistCount() {


        const countElement =
            document.querySelector(
                ".watchlist-count strong"
            );


        const labelElement =
            document.querySelector(
                ".watchlist-count span"
            );


        if (!countElement) {
            return;
        }


        const items =
            document.querySelectorAll(
                ".watchlist-item"
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
    /* EMPTY STATE                                            */
    /* ===================================================== */

    function checkEmptyWatchlist() {


        const grid =
            document.querySelector(
                "#watchlistGrid"
            );


        if (!grid) {
            return;
        }


        const items =
            grid.querySelectorAll(
                ".watchlist-item"
            );


        if (items.length > 0) {
            return;
        }


        window.location.reload();

    }

});