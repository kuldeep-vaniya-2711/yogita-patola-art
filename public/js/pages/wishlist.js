/* ========================================================= */
/* WISHLIST PAGE JS                                          */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    function updateWishlistCount() {
        const countElement = document.querySelector(".wishlist-count strong");
        const labelElement = document.querySelector(".wishlist-count span");
        if (!countElement) return;

        const count = document.querySelectorAll(".wishlist-item").length;
        countElement.textContent = count;
        if (labelElement) labelElement.textContent = count === 1 ? "Item" : "Items";
    }

    function checkEmptyWishlist() {
        const grid = document.querySelector("#wishlistGrid");
        if (grid && grid.querySelectorAll(".wishlist-item").length === 0) {
            window.location.reload();
        }
    }

    document.querySelectorAll(".wishlist-remove-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const productId = button.dataset.productId;
            if (!productId) return console.error("Wishlist product ID missing.");

            const item = button.closest(".wishlist-item");
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
                            updateWishlistCount();
                            checkEmptyWishlist();
                        }, 250);
                    }
                    return;
                }
                console.error("Unable to remove wishlist item.", data);
                button.disabled = false;
                button.innerHTML = '<span aria-hidden="true">♥</span> Remove';
                alert("Unable to remove this product from your wishlist.");
            } catch (error) {
                console.error("Wishlist remove error:", error);
                button.disabled = false;
                button.innerHTML = '<span aria-hidden="true">♥</span> Remove';
                alert("Something went wrong. Please try again.");
            }
        });
    });
});