/* ========================================================= */
/* ADMIN VISITORS JAVASCRIPT                                 */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("visitorSearch");
    const clearSearchButton = document.getElementById("clearVisitorSearch");
    const visitorRows = document.querySelectorAll(".visitor-row");
    const searchEmpty = document.getElementById("visitorSearchEmpty");

    function filterVisitors() {
        const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
        let visibleRows = 0;

        visitorRows.forEach(row => {
            const searchableText = row.dataset.search || "";
            const shouldShow = !searchValue || searchableText.includes(searchValue);
            row.style.display = shouldShow ? "" : "none";
            if (shouldShow) visibleRows++;
        });

        if (searchEmpty) searchEmpty.hidden = visibleRows !== 0;
    }

    if (searchInput) searchInput.addEventListener("input", filterVisitors);
    if (clearSearchButton) {
        clearSearchButton.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = "";
                searchInput.focus();
            }
            filterVisitors();
        });
    }

    filterVisitors();
});