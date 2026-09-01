/* =========================================================
   YOGITA PATOLA ART
   ADMIN — REVIEWS MANAGEMENT
   reviews.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const reviewTable = document.querySelector("#reviewsTable");

    const searchInput = document.querySelector("#reviewSearch");

    const statusFilter = document.querySelector("#reviewStatusFilter");

    const ratingFilter = document.querySelector("#reviewRatingFilter");

    const clearFiltersButton =
        document.querySelector("#clearReviewFilters");


    /* =====================================================
       SEARCH / FILTER
    ===================================================== */

    function filterReviews() {

        if (!reviewTable) {
            return;
        }

        const rows = reviewTable.querySelectorAll(
            "tbody tr.review-row"
        );

        const searchValue =
            searchInput
                ? searchInput.value.trim().toLowerCase()
                : "";

        const statusValue =
            statusFilter
                ? statusFilter.value.toLowerCase()
                : "";

        const ratingValue =
            ratingFilter
                ? ratingFilter.value
                : "";


        rows.forEach((row) => {

            const searchText =
                row.textContent.toLowerCase();

            const rowStatus =
                row.dataset.status
                    ? row.dataset.status.toLowerCase()
                    : "";

            const rowRating =
                row.dataset.rating
                    ? row.dataset.rating
                    : "";


            const matchesSearch =
                !searchValue ||
                searchText.includes(searchValue);


            const matchesStatus =
                !statusValue ||
                rowStatus === statusValue;


            const matchesRating =
                !ratingValue ||
                rowRating === ratingValue;


            if (
                matchesSearch &&
                matchesStatus &&
                matchesRating
            ) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        });


        updateEmptyState();

    }


    /* =====================================================
       EMPTY FILTER STATE
    ===================================================== */

    function updateEmptyState() {

        if (!reviewTable) {
            return;
        }

        const rows = reviewTable.querySelectorAll(
            "tbody tr.review-row"
        );

        const visibleRows = Array.from(rows).filter(
            (row) => row.style.display !== "none"
        );


        let emptyMessage =
            reviewTable.querySelector(
                ".review-filter-empty"
            );


        if (visibleRows.length === 0 && rows.length > 0) {

            if (!emptyMessage) {

                emptyMessage =
                    document.createElement("tr");

                emptyMessage.className =
                    "review-filter-empty";

                emptyMessage.innerHTML = `
                    <td
                        colspan="100%"
                        class="text-center py-5"
                    >
                        <div class="py-3">

                            <i
                                class="bi bi-search"
                                style="font-size: 2rem;"
                            ></i>

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
       EVENT LISTENERS
    ===================================================== */

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


    if (clearFiltersButton) {

        clearFiltersButton.addEventListener(
            "click",
            () => {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "";
                }

                if (ratingFilter) {
                    ratingFilter.value = "";
                }

                filterReviews();

            }
        );

    }


    /* =====================================================
       CONFIRM REVIEW ACTIONS
    ===================================================== */

    const actionForms =
        document.querySelectorAll(
            ".review-action-form"
        );


    actionForms.forEach((form) => {

        form.addEventListener(
            "submit",
            (event) => {

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


    /* =====================================================
       INDIVIDUAL APPROVE BUTTON
       ===================================================== */

    const approveButtons =
        document.querySelectorAll(
            ".approve-review-btn"
        );


    approveButtons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                const confirmed =
                    window.confirm(
                        "Are you sure you want to approve this review?"
                    );


                if (!confirmed) {

                    event.preventDefault();

                }

            }
        );

    });


    /* =====================================================
       INDIVIDUAL REJECT BUTTON
       ===================================================== */

    const rejectButtons =
        document.querySelectorAll(
            ".reject-review-btn"
        );


    rejectButtons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                const confirmed =
                    window.confirm(
                        "Are you sure you want to reject this review?"
                    );


                if (!confirmed) {

                    event.preventDefault();

                }

            }
        );

    });


    /* =====================================================
       DELETE REVIEW BUTTON
    ===================================================== */

    const deleteButtons =
        document.querySelectorAll(
            ".delete-review-btn"
        );


    deleteButtons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                const confirmed =
                    window.confirm(
                        "This review will be permanently deleted. Continue?"
                    );


                if (!confirmed) {

                    event.preventDefault();

                }

            }
        );

    });


    /* =====================================================
       RATING DISPLAY
    ===================================================== */

    const ratingContainers =
        document.querySelectorAll(
            ".admin-review-stars"
        );


    ratingContainers.forEach((container) => {

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


        const stars =
            container.querySelectorAll(
                "i"
            );


        stars.forEach((star, index) => {

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
    ===================================================== */

    const messageButtons =
        document.querySelectorAll(
            ".review-message-toggle"
        );


    messageButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const targetSelector =
                    button.dataset.target;


                if (!targetSelector) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetSelector
                    );


                if (!target) {
                    return;
                }


                const isHidden =
                    target.classList.contains(
                        "d-none"
                    );


                if (isHidden) {

                    target.classList.remove(
                        "d-none"
                    );

                    button.innerHTML =
                        `
                        <i class="bi bi-chevron-up"></i>
                        Hide
                        `;

                } else {

                    target.classList.add(
                        "d-none"
                    );

                    button.innerHTML =
                        `
                        <i class="bi bi-chevron-down"></i>
                        View
                        `;

                }

            }
        );

    });


    /* =====================================================
       SELECT ALL REVIEWS
    ===================================================== */

    const selectAll =
        document.querySelector(
            "#selectAllReviews"
        );


    const reviewCheckboxes =
        document.querySelectorAll(
            ".review-select"
        );


    if (selectAll) {

        selectAll.addEventListener(
            "change",
            () => {

                reviewCheckboxes.forEach(
                    (checkbox) => {

                        if (
                            checkbox.closest(
                                ".review-row"
                            )?.style.display !== "none"
                        ) {

                            checkbox.checked =
                                selectAll.checked;

                        }

                    }
                );

                updateBulkActionState();

            }
        );

    }


    reviewCheckboxes.forEach(
        (checkbox) => {

            checkbox.addEventListener(
                "change",
                updateBulkActionState
            );

        }
    );


    /* =====================================================
       BULK ACTION STATE
    ===================================================== */

    function updateBulkActionState() {

        const selected =
            document.querySelectorAll(
                ".review-select:checked"
            );


        const bulkButtons =
            document.querySelectorAll(
                ".bulk-review-action"
            );


        bulkButtons.forEach(
            (button) => {

                button.disabled =
                    selected.length === 0;

            }
        );


        if (selectAll) {

            const visibleCheckboxes =
                Array.from(reviewCheckboxes)
                    .filter(
                        (checkbox) =>
                            checkbox.closest(
                                ".review-row"
                            )?.style.display !== "none"
                    );


            const checkedVisible =
                visibleCheckboxes.filter(
                    (checkbox) =>
                        checkbox.checked
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


    /* =====================================================
       BULK ACTION CONFIRMATION
    ===================================================== */

    const bulkActionForms =
        document.querySelectorAll(
            ".bulk-review-form"
        );


    bulkActionForms.forEach(
        (form) => {

            form.addEventListener(
                "submit",
                (event) => {

                    const selected =
                        document.querySelectorAll(
                            ".review-select:checked"
                        );


                    if (
                        selected.length === 0
                    ) {

                        event.preventDefault();

                        alert(
                            "Please select at least one review."
                        );

                        return;

                    }


                    const action =
                        form.dataset.action || "";


                    let message =
                        `Are you sure you want to ${action} ${selected.length} review(s)?`;


                    if (
                        action === "delete"
                    ) {

                        message =
                            `This will permanently delete ${selected.length} review(s). Continue?`;

                    }


                    if (
                        !window.confirm(
                            message
                        )
                    ) {

                        event.preventDefault();

                        return;

                    }


                    /*
                     * Copy selected review IDs
                     * into hidden inputs.
                     */

                    selected.forEach(
                        (checkbox) => {

                            const input =
                                document.createElement(
                                    "input"
                                );

                            input.type = "hidden";

                            input.name =
                                "reviewIds[]";

                            input.value =
                                checkbox.value;

                            form.appendChild(
                                input
                            );

                        }
                    );

                }
            );

        }
    );


    /* =====================================================
       AUTO HIDE ALERTS
    ===================================================== */

    const alerts =
        document.querySelectorAll(
            ".admin-alert-container .alert"
        );


    alerts.forEach((alert) => {

        const closeButton =
            alert.querySelector(
                ".btn-close"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => {

                    alert.remove();

                }
            );

        }


        setTimeout(
            () => {

                if (
                    document.body.contains(
                        alert
                    )
                ) {

                    alert.style.transition =
                        "opacity 0.4s ease";

                    alert.style.opacity = "0";


                    setTimeout(
                        () => {

                            if (
                                document.body.contains(
                                    alert
                                )
                            ) {

                                alert.remove();

                            }

                        },
                        400
                    );

                }

            },
            5000
        );

    });


    /* =====================================================
       TOOLTIP INITIALIZATION
    ===================================================== */

    if (
        typeof bootstrap !== "undefined"
    ) {

        const tooltipElements =
            document.querySelectorAll(
                '[data-bs-toggle="tooltip"]'
            );


        tooltipElements.forEach(
            (element) => {

                new bootstrap.Tooltip(
                    element
                );

            }
        );

    }


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    filterReviews();

    updateBulkActionState();


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "Admin Reviews JS loaded successfully."
    );

});