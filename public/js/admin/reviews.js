/* =========================================================
   YOGITA PATOLA ART — ADMIN REVIEWS MANAGEMENT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const reviewTable = document.querySelector("#reviewsTable");
    const searchInput = document.querySelector("#reviewSearch");
    const statusFilter = document.querySelector("#reviewStatusFilter");
    const ratingFilter = document.querySelector("#reviewRatingFilter");
    const clearFiltersButton = document.querySelector("#clearReviewFilters");

    function filterReviews() {
        if (!reviewTable) return;
        const rows = reviewTable.querySelectorAll("tbody tr.review-row");
        const searchValue = searchInput?.value.trim().toLowerCase() || "";
        const statusValue = statusFilter?.value.toLowerCase() || "";
        const ratingValue = ratingFilter?.value || "";

        rows.forEach(row => {
            const searchText = row.textContent.toLowerCase();
            const rowStatus = (row.dataset.status || "").toLowerCase();
            const rowRating = row.dataset.rating || "";

            const matchesSearch = !searchValue || searchText.includes(searchValue);
            const matchesStatus = !statusValue || rowStatus === statusValue;
            const matchesRating = !ratingValue || rowRating === ratingValue;

            row.style.display = matchesSearch && matchesStatus && matchesRating ? "" : "none";
        });

        updateEmptyState();
    }

    function updateEmptyState() {
        if (!reviewTable) return;
        const rows = reviewTable.querySelectorAll("tbody tr.review-row");
        const visibleRows = Array.from(rows).filter(r => r.style.display !== "none");
        let emptyMessage = reviewTable.querySelector(".review-filter-empty");

        if (visibleRows.length === 0 && rows.length > 0) {
            if (!emptyMessage) {
                emptyMessage = document.createElement("tr");
                emptyMessage.className = "review-filter-empty";
                emptyMessage.innerHTML = `
                    <td colspan="100%" class="text-center py-5">
                        <div class="py-3">
                            <i class="bi bi-search" style="font-size: 2rem;"></i>
                            <div class="mt-2 fw-semibold">No reviews found</div>
                            <small class="text-muted">Try changing your search or filters.</small>
                        </div>
                    </td>`;
                reviewTable.querySelector("tbody").appendChild(emptyMessage);
            }
            emptyMessage.style.display = "";
        } else if (emptyMessage) {
            emptyMessage.style.display = "none";
        }
    }

    if (searchInput) searchInput.addEventListener("input", filterReviews);
    if (statusFilter) statusFilter.addEventListener("change", filterReviews);
    if (ratingFilter) ratingFilter.addEventListener("change", filterReviews);

    if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "";
            if (ratingFilter) ratingFilter.value = "";
            filterReviews();
        });
    }

    // Action Form Confirmations
    document.querySelectorAll(".review-action-form").forEach(form => {
        form.addEventListener("submit", event => {
            const action = form.dataset.action || "";
            let message = "Are you sure you want to continue?";
            if (action === "approve") message = "Are you sure you want to approve this review?";
            if (action === "reject") message = "Are you sure you want to reject this review?";
            if (action === "delete") message = "Are you sure you want to permanently delete this review?";
            if (!window.confirm(message)) event.preventDefault();
        });
    });

    document.querySelectorAll(".approve-review-btn").forEach(btn => {
        btn.addEventListener("click", e => { if (!window.confirm("Are you sure you want to approve this review?")) e.preventDefault(); });
    });

    document.querySelectorAll(".reject-review-btn").forEach(btn => {
        btn.addEventListener("click", e => { if (!window.confirm("Are you sure you want to reject this review?")) e.preventDefault(); });
    });

    document.querySelectorAll(".delete-review-btn").forEach(btn => {
        btn.addEventListener("click", e => { if (!window.confirm("This review will be permanently deleted. Continue?")) e.preventDefault(); });
    });

    // Rating star rendering
    document.querySelectorAll(".admin-review-stars").forEach(container => {
        const rating = parseInt(container.dataset.rating || "0", 10);
        if (Number.isNaN(rating) || rating < 0) return;
        container.querySelectorAll("i").forEach((star, index) => {
            if (index < rating) {
                star.classList.remove("bi-star");
                star.classList.add("bi-star-fill");
            } else {
                star.classList.remove("bi-star-fill");
                star.classList.add("bi-star");
            }
        });
    });

    // Review Message Toggle
    document.querySelectorAll(".review-message-toggle").forEach(button => {
        button.addEventListener("click", () => {
            const target = button.dataset.target ? document.querySelector(button.dataset.target) : null;
            if (!target) return;
            const isHidden = target.classList.contains("d-none");
            target.classList.toggle("d-none");
            button.innerHTML = isHidden ? '<i class="bi bi-chevron-up"></i> Hide' : '<i class="bi bi-chevron-down"></i> View';
        });
    });

    // Bulk Actions & Select All
    const selectAll = document.querySelector("#selectAllReviews");
    const reviewCheckboxes = document.querySelectorAll(".review-select");

    function updateBulkActionState() {
        const selected = document.querySelectorAll(".review-select:checked");
        document.querySelectorAll(".bulk-review-action").forEach(btn => { btn.disabled = selected.length === 0; });

        if (selectAll) {
            const visibleCheckboxes = Array.from(reviewCheckboxes).filter(cb => cb.closest(".review-row")?.style.display !== "none");
            const checkedVisible = visibleCheckboxes.filter(cb => cb.checked);
            selectAll.checked = visibleCheckboxes.length > 0 && checkedVisible.length === visibleCheckboxes.length;
            selectAll.indeterminate = checkedVisible.length > 0 && checkedVisible.length < visibleCheckboxes.length;
        }
    }

    if (selectAll) {
        selectAll.addEventListener("change", () => {
            reviewCheckboxes.forEach(cb => {
                if (cb.closest(".review-row")?.style.display !== "none") cb.checked = selectAll.checked;
            });
            updateBulkActionState();
        });
    }

    reviewCheckboxes.forEach(cb => cb.addEventListener("change", updateBulkActionState));

    document.querySelectorAll(".bulk-review-form").forEach(form => {
        form.addEventListener("submit", event => {
            const selected = document.querySelectorAll(".review-select:checked");
            if (selected.length === 0) {
                event.preventDefault();
                return alert("Please select at least one review.");
            }
            const action = form.dataset.action || "";
            const message = action === "delete"
                ? `This will permanently delete ${selected.length} review(s). Continue?`
                : `Are you sure you want to ${action} ${selected.length} review(s)?`;

            if (!window.confirm(message)) return event.preventDefault();

            selected.forEach(cb => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = "reviewIds[]";
                input.value = cb.value;
                form.appendChild(input);
            });
        });
    });

    // Auto-hide Alerts
    document.querySelectorAll(".admin-alert-container .alert").forEach(alert => {
        const closeBtn = alert.querySelector(".btn-close");
        if (closeBtn) closeBtn.addEventListener("click", () => alert.remove());
        setTimeout(() => {
            if (document.body.contains(alert)) {
                alert.style.transition = "opacity 0.4s ease";
                alert.style.opacity = "0";
                setTimeout(() => { if (document.body.contains(alert)) alert.remove(); }, 400);
            }
        }, 5000);
    });

    // Tooltip Initialization
    if (typeof bootstrap !== "undefined") {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
    }

    filterReviews();
    updateBulkActionState();
    console.log("Admin Reviews JS loaded successfully.");
});