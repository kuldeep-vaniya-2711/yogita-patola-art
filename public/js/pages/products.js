/* ================================================= */
/* PRODUCTS PAGE JS                                  */
/* ================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("#productSearch");
    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                searchInput.closest("form")?.submit();
            }
        });
    }

    document.querySelectorAll(".products-grid img").forEach(img => {
        img.addEventListener("error", () => { img.style.display = "none"; });
    });

    document.querySelectorAll(".product-grid-item").forEach(item => {
        item.addEventListener("mouseenter", () => item.classList.add("product-item-active"));
        item.addEventListener("mouseleave", () => item.classList.remove("product-item-active"));
    });
});