/* ========================================================= */
/* WATCHLIST PAGE JS                                         */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    function resetButton(button) {
        button.disabled = false;
        button.innerHTML = '<span aria-hidden="true">×</span> Remove';
    }

    function updateWatchlistCount() {
        const countElement = document.querySelector(".watchlist-count strong");
        const labelElement = document.querySelector(".watchlist-count span");
        if (!countElement) return;

        const count = document.querySelectorAll(".watchlist-item").length;
        countElement.textContent = count;
        if (labelElement) labelElement.textContent = count === 1 ? "Item" : "Items";
    }

    function checkEmptyWatchlist() {
        const grid = document.querySelector("#watchlistGrid");
        if (grid && grid.querySelectorAll(".watchlist-item").length === 0) {
            window.location.reload();
        }
    }

    document.querySelectorAll(".watchlist-remove-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.productId;
            if (!productId) return console.error("Watchlist product ID missing.");

            const item = button.closest(".watchlist-item");
            button.disabled = true;
            button.innerHTML = "Removing...";

            try {
                const response = await fetch(`/wishlist/remove/${productId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await response.json().catch(() => null);

                if (response.ok && (!data || data.success !== false)) {
                    if (item) {
                        item.classList.add("removing");
                        setTimeout(() => {
                            item.remove();
                            updateWatchlistCount();
                            checkEmptyWatchlist();
                        }, 250);
                    }
                    return;
                }
                console.error("Unable to remove watchlist item.", data);
                resetButton(button);
                alert("Unable to remove this product.");
            } catch (error) {
                console.error("Watchlist remove error:", error);
                resetButton(button);
                alert("Something went wrong. Please try again.");
            }
        });
    });
});