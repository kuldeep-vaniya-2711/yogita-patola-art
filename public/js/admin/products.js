/* =========================================================
   ADMIN PRODUCTS PAGE - Yogita Patola Art
   Search / Filter / Delete Modal / Row Highlight
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initProductFilters();
    initProductDeleteConfirmation();
    initProductRowHighlight();
});

function initProductFilters() {
    const search = document.getElementById("productSearch");
    const category = document.getElementById("categoryFilter");
    const availability = document.getElementById("availabilityFilter");
    const reset = document.getElementById("resetFilters");
    const clear = document.getElementById("clearFiltersFromEmpty");

    if (!search || !category || !availability) return;

    const applyFilters = () => {
        const sVal = search.value.toLowerCase().trim();
        const cVal = category.value.toLowerCase().trim();
        const aVal = availability.value.toLowerCase().trim();
        const rows = [...document.querySelectorAll(".product-row")];
        let visible = 0;

        rows.forEach(row => {
            const name = (row.dataset.name || "").toLowerCase();
            const rowCat = (row.dataset.category || "").toLowerCase();
            const rowAvail = (row.dataset.availability || "").toLowerCase();

            const match = (!sVal || name.includes(sVal)) &&
                          (cVal === "all" || rowCat === cVal) &&
                          (aVal === "all" || rowAvail === aVal);

            row.style.display = match ? "" : "none";
            if (match) visible++;
        });

        const count = document.getElementById("visibleProductCount");
        const status = document.getElementById("filterStatus");
        const empty = document.getElementById("filterEmptyState");
        const table = document.getElementById("productsTable");
        const filtered = Boolean(sVal) || cVal !== "all" || aVal !== "all";

        if (count) count.textContent = visible;
        if (status) status.textContent = !filtered ? "All products" : `${visible} of ${rows.length} products`;
        if (empty) empty.style.display = filtered && visible === 0 ? "block" : "none";
        if (table) table.style.display = filtered && visible === 0 ? "none" : "";
    };

    search.addEventListener("input", applyFilters);
    category.addEventListener("change", applyFilters);
    availability.addEventListener("change", applyFilters);

    const resetAll = () => {
        search.value = "";
        category.value = "all";
        availability.value = "all";
        applyFilters();
    };

    reset?.addEventListener("click", resetAll);
    clear?.addEventListener("click", resetAll);
    applyFilters();
}

function initProductDeleteConfirmation() {
    const modalEl = document.getElementById("deleteProductModal");
    const nameEl = document.getElementById("deleteProductName");
    const confirmBtn = document.getElementById("confirmDeleteProduct");
    const forms = document.querySelectorAll(".delete-product-form");

    if (!modalEl || !nameEl || !confirmBtn || !forms.length) return;

    const deleteModal = new bootstrap.Modal(modalEl);
    let selectedForm = null;

    forms.forEach(form => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            selectedForm = form;
            const row = form.closest(".product-row");
            nameEl.textContent = row?.querySelector(".product-table-details strong")?.textContent.trim() || "this product";
            deleteModal.show();
        });
    });

    confirmBtn.addEventListener("click", () => {
        if (!selectedForm) return;
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Deleting...';
        selectedForm.submit();
    });

    modalEl.addEventListener("hidden.bs.modal", () => {
        selectedForm = null;
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Delete Product";
    });
}

function initProductRowHighlight() {
    const rows = document.querySelectorAll(".product-row");
    if (!rows.length) return;

    rows.forEach(row => {
        row.addEventListener("click", (e) => {
            if (e.target.closest("a, button, form")) return;
            rows.forEach(r => r.classList.remove("product-row-selected"));
            row.classList.add("product-row-selected");
        });
    });
}

function clearProductSearch() {
    const search = document.getElementById("productSearch");
    const category = document.getElementById("categoryFilter");
    const availability = document.getElementById("availabilityFilter");
    if (search) search.value = "";
    if (category) category.value = "all";
    if (availability) availability.value = "all";
    if (search) search.dispatchEvent(new Event("input"));
}

window.clearProductSearch = clearProductSearch;