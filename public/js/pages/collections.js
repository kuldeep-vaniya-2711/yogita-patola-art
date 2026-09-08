/* ================================================= */
/* COLLECTIONS PAGE JS                              */
/* ================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".collections-search-form input[name='search']");
    const categorySelect = document.querySelector(".collections-category-form select[name='category']");

    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                searchInput.closest("form")?.submit();
            }
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", () => {
            categorySelect.closest("form")?.submit();
        });
    }

    document.querySelectorAll(".collections-product-grid img").forEach(image => {
        image.addEventListener("error", () => { image.style.display = "none"; });
    });
});