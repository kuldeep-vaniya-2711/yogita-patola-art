
/* =========================================================
   YOGITA PATOLA ART — ADMIN REVIEWS MANAGEMENT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const reviewTable =
        document.querySelector("#reviewsTable");

    const searchInput =
        document.querySelector("#reviewSearch");

    const statusFilter =
        document.querySelector("#reviewStatusFilter");

    const ratingFilter =
        document.querySelector("#reviewRatingFilter");

    const clearFiltersButton =
        document.querySelector("#clearReviewFilters");


    /* =====================================================
       FILTER REVIEWS
    ====================================================== */

    function filterReviews() {

        if (!reviewTable) return;

        const rows =
            reviewTable.querySelectorAll(
                "tbody tr.review-row"
            );

        const searchValue =
            searchInput?.value.trim().toLowerCase() || "";

        const statusValue =
            statusFilter?.value.toLowerCase() || "all";

        const ratingValue =
            ratingFilter?.value || "all";


        rows.forEach(row => {

            const searchText =
                row.textContent.toLowerCase();

            const rowStatus =
                (row.dataset.status || "").toLowerCase();

            const rowRating =
                row.dataset.rating || "";


            const matchesSearch =
                !searchValue ||
                searchText.includes(searchValue);

            const matchesStatus =
                statusValue === "all" ||
                rowStatus === statusValue;

            const matchesRating =
                ratingValue === "all" ||
                rowRating === ratingValue;


            row.style.display =
                matchesSearch &&
                matchesStatus &&
                matchesRating
                    ? ""
                    : "none";

        });


        updateEmptyState();

    }


    /* =====================================================
       EMPTY STATE
    ====================================================== */

    function updateEmptyState() {

        if (!reviewTable) return;

        const rows =
            reviewTable.querySelectorAll(
                "tbody tr.review-row"
            );

        const visibleRows =
            Array.from(rows).filter(
                row => row.style.display !== "none"
            );

        let emptyMessage =
            reviewTable.querySelector(
                ".review-filter-empty"
            );


        if (
            visibleRows.length === 0 &&
            rows.length > 0
        ) {

            if (!emptyMessage) {

                emptyMessage =
                    document.createElement("tr");

                emptyMessage.className =
                    "review-filter-empty";

                emptyMessage.innerHTML = `
                    <td colspan="100%" class="text-center py-5">
                        <div class="py-3">
                            <i class="bi bi-search" style="font-size: 2rem;"></i>
                            <div class="mt-2 fw-semibold">
                                No reviews found
                            </div>
                            <small class="text-muted">
                                Try changing your search or filters.
                            </small>
                        </div>
                    </td>
                `;

                reviewTable
                    .querySelector("tbody")
                    .appendChild(emptyMessage);

            }

            emptyMessage.style.display = "";

        } else if (emptyMessage) {

            emptyMessage.style.display = "none";

        }

    }


    /* =====================================================
       FILTER EVENTS
    ====================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterReviews
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterReviews
        );

    }


    if (ratingFilter) {

        ratingFilter.addEventListener(
            "change",
            filterReviews
        );

    }


    /* =====================================================
       CLEAR FILTERS
    ====================================================== */

    if (clearFiltersButton) {

        clearFiltersButton.addEventListener(
            "click",
            () => {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "all";
                }

                if (ratingFilter) {
                    ratingFilter.value = "all";
                }

                filterReviews();

            }
        );

    }


    /* =====================================================
       ACTION FORM CONFIRMATIONS
    ====================================================== */

    document
        .querySelectorAll(".review-action-form")
        .forEach(form => {

            form.addEventListener(
                "submit",
                event => {

                    const action =
                        form.dataset.action || "";

                    let message =
                        "Are you sure you want to continue?";


                    if (action === "approve") {
                        message =
                            "Are you sure you want to approve this review?";
                    }

                    if (action === "reject") {
                        message =
                            "Are you sure you want to reject this review?";
                    }

                    if (action === "delete") {
                        message =
                            "Are you sure you want to permanently delete this review?";
                    }


                    if (!window.confirm(message)) {
                        event.preventDefault();
                    }

                }
            );

        });


    document
        .querySelectorAll(".approve-review-btn")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                event => {

                    if (
                        !window.confirm(
                            "Are you sure you want to approve this review?"
                        )
                    ) {
                        event.preventDefault();
                    }

                }
            );

        });


    document
        .querySelectorAll(".reject-review-btn")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                event => {

                    if (
                        !window.confirm(
                            "Are you sure you want to reject this review?"
                        )
                    ) {
                        event.preventDefault();
                    }

                }
            );

        });


    document
        .querySelectorAll(".delete-review-btn")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                event => {

                    if (
                        !window.confirm(
                            "This review will be permanently deleted. Continue?"
                        )
                    ) {
                        event.preventDefault();
                    }

                }
            );

        });


    /* =====================================================
       RATING STAR RENDERING
    ====================================================== */

    document
        .querySelectorAll(".admin-review-stars")
        .forEach(container => {

            const rating =
                parseInt(
                    container.dataset.rating || "0",
                    10
                );


            if (
                Number.isNaN(rating) ||
                rating < 0
            ) {
                return;
            }


            container
                .querySelectorAll("i")
                .forEach((star, index) => {

                    if (index < rating) {

                        star.classList.remove(
                            "bi-star"
                        );

                        star.classList.add(
                            "bi-star-fill"
                        );

                    } else {

                        star.classList.remove(
                            "bi-star-fill"
                        );

                        star.classList.add(
                            "bi-star"
                        );

                    }

                });

        });


    /* =====================================================
       REVIEW MESSAGE TOGGLE
    ====================================================== */

    document
        .querySelectorAll(".review-message-toggle")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.target
                            ? document.querySelector(
                                button.dataset.target
                            )
                            : null;


                    if (!target) return;


                    const isHidden =
                        target.classList.contains(
                            "d-none"
                        );


                    target.classList.toggle(
                        "d-none"
                    );


                    button.innerHTML =
                        isHidden
                            ? '<i class="bi bi-chevron-up"></i> Hide'
                            : '<i class="bi bi-chevron-down"></i> View';

                }
            );

        });


    /* =====================================================
       BULK ACTIONS & SELECT ALL
    ====================================================== */

    const selectAll =
        document.querySelector(
            "#selectAllReviews"
        );

    const reviewCheckboxes =
        document.querySelectorAll(
            ".review-select"
        );


    function updateBulkActionState() {

        const selected =
            document.querySelectorAll(
                ".review-select:checked"
            );


        document
            .querySelectorAll(".bulk-review-action")
            .forEach(btn => {

                btn.disabled =
                    selected.length === 0;

            });


        if (selectAll) {

            const visibleCheckboxes =
                Array.from(
                    reviewCheckboxes
                ).filter(
                    cb =>
                        cb.closest(".review-row")
                            ?.style.display !== "none"
                );


            const checkedVisible =
                visibleCheckboxes.filter(
                    cb => cb.checked
                );


            selectAll.checked =
                visibleCheckboxes.length > 0 &&
                checkedVisible.length ===
                    visibleCheckboxes.length;


            selectAll.indeterminate =
                checkedVisible.length > 0 &&
                checkedVisible.length <
                    visibleCheckboxes.length;

        }

    }


    if (selectAll) {

        selectAll.addEventListener(
            "change",
            () => {

                reviewCheckboxes.forEach(cb => {

                    if (
                        cb.closest(".review-row")
                            ?.style.display !== "none"
                    ) {
                        cb.checked =
                            selectAll.checked;
                    }

                });


                updateBulkActionState();

            }
        );

    }


    reviewCheckboxes.forEach(
        cb =>
            cb.addEventListener(
                "change",
                updateBulkActionState
            )
    );


    document
        .querySelectorAll(".bulk-review-form")
        .forEach(form => {

            form.addEventListener(
                "submit",
                event => {

                    const selected =
                        document.querySelectorAll(
                            ".review-select:checked"
                        );


                    if (selected.length === 0) {

                        event.preventDefault();

                        alert(
                            "Please select at least one review."
                        );

                        return;

                    }


                    const action =
                        form.dataset.action || "";


                    const message =
                        action === "delete"
                            ? `This will permanently delete ${selected.length} review(s). Continue?`
                            : `Are you sure you want to ${action} ${selected.length} review(s)?`;


                    if (
                        !window.confirm(message)
                    ) {

                        event.preventDefault();

                        return;

                    }


                    selected.forEach(cb => {

                        const input =
                            document.createElement(
                                "input"
                            );

                        input.type = "hidden";
                        input.name = "reviewIds[]";
                        input.value = cb.value;

                        form.appendChild(input);

                    });

                }
            );

        });


    /* =====================================================
       AUTO-HIDE ALERTS
    ====================================================== */

    document
        .querySelectorAll(
            ".admin-alert-container .alert"
        )
        .forEach(alert => {

            const closeBtn =
                alert.querySelector(
                    ".btn-close"
                );


            if (closeBtn) {

                closeBtn.addEventListener(
                    "click",
                    () => alert.remove()
                );

            }


            setTimeout(() => {

                if (document.body.contains(alert)) {

                    alert.style.transition =
                        "opacity 0.4s ease";

                    alert.style.opacity = "0";


                    setTimeout(() => {

                        if (
                            document.body.contains(
                                alert
                            )
                        ) {
                            alert.remove();
                        }

                    }, 400);

                }

            }, 5000);

        });


    /* =====================================================
       TOOLTIP INITIALIZATION
    ====================================================== */

    if (typeof bootstrap !== "undefined") {

        document
            .querySelectorAll(
                '[data-bs-toggle="tooltip"]'
            )
            .forEach(
                el =>
                    new bootstrap.Tooltip(el)
            );

    }


    /* =====================================================
       INITIAL LOAD
       ALL REVIEWS MUST BE VISIBLE
    ====================================================== */

    if (statusFilter) {
        statusFilter.value = "all";
    }

    if (ratingFilter) {
        ratingFilter.value = "all";
    }

    if (searchInput) {
        searchInput.value = "";
    }

    filterReviews();
    updateBulkActionState();


    console.log(
        "Admin Reviews JS loaded successfully."
    );

});