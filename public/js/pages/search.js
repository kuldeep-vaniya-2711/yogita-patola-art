/* =========================================================
   YOGITA PATOLA ART - SEARCH PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.focus();

        searchInput.addEventListener("input", function () {
            this.classList.remove("is-invalid");
        });

        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                this.value = "";
                this.focus();
            }
        });
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (e) {
            const searchValue = searchInput.value.trim();
            if (!searchValue) {
                e.preventDefault();
                searchInput.focus();
                searchInput.classList.add("is-invalid");
                return;
            }
            searchInput.value = searchValue;
        });
    }

    const productItems = document.querySelectorAll(".search-grid-item");
    if (productItems.length > 0) {
        productItems.forEach((item, index) => {
            item.style.opacity = "0";
            item.style.transform = "translateY(15px)";
            setTimeout(() => {
                item.style.transition = "opacity .35s ease, transform .35s ease";
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
            }, index * 70);
        });
    }
});