
document.addEventListener("DOMContentLoaded", function () {

    // =========================================================
    // DATA
    // =========================================================

    const feedbackData =
        window.adminFeedbackData || {};

    const feedbacks =
        Array.isArray(feedbackData.feedbacks)
            ? feedbackData.feedbacks
            : [];


    // =========================================================
    // ELEMENTS
    // =========================================================

    const searchInput =
        document.getElementById("feedbackSearch");

    const statusFilter =
        document.getElementById("feedbackStatusFilter");

    const typeFilter =
        document.getElementById("feedbackTypeFilter");

    const tableBody =
        document.getElementById("feedbackTableBody");


    // =========================================================
    // VIEW MODAL
    // =========================================================

    const viewModalElement =
        document.getElementById("feedbackViewModal");

    const viewModal =
        viewModalElement && typeof bootstrap !== "undefined"
            ? new bootstrap.Modal(viewModalElement)
            : null;


    const modalName =
        document.getElementById("modalFeedbackName");

    const modalEmail =
        document.getElementById("modalFeedbackEmail");

    const modalType =
        document.getElementById("modalFeedbackType");

    const modalStatus =
        document.getElementById("modalFeedbackStatus");

    const modalMessage =
        document.getElementById("modalFeedbackMessage");


    // =========================================================
    // STATUS MODAL
    // =========================================================

    const statusModalElement =
        document.getElementById("feedbackStatusModal");

    const statusModal =
        statusModalElement && typeof bootstrap !== "undefined"
            ? new bootstrap.Modal(statusModalElement)
            : null;


    const statusSelect =
        document.getElementById("feedbackStatusSelect");

    const selectedFeedbackId =
        document.getElementById("selectedFeedbackId");

    const saveStatusButton =
        document.getElementById("saveFeedbackStatusBtn");


    // =========================================================
    // DELETE MODAL
    // =========================================================

    const deleteModalElement =
        document.getElementById("feedbackDeleteModal");

    const deleteModal =
        deleteModalElement && typeof bootstrap !== "undefined"
            ? new bootstrap.Modal(deleteModalElement)
            : null;


    const deleteFeedbackId =
        document.getElementById("deleteFeedbackId");

    const confirmDeleteButton =
        document.getElementById("confirmFeedbackDeleteBtn");


    // =========================================================
    // HELPER - FIND FEEDBACK
    // =========================================================

    function getFeedbackById(id) {

        return feedbacks.find(function (feedback) {

            return String(feedback._id) === String(id);

        });

    }


    // =========================================================
    // UPDATE COUNTERS
    // =========================================================

    function updateCounters() {

        const newCountElement =
            document.getElementById("newFeedbackCount");

        const statCards =
            document.querySelectorAll(
                ".admin-feedback-stat"
            );

        let resolvedCountElement = null;

        if (statCards.length >= 3) {

            resolvedCountElement =
                statCards[2].querySelector("strong");

        }


        const newCount =
            feedbacks.filter(function (feedback) {

                return (
                    feedback.status ||
                    "New"
                ) === "New";

            }).length;


        const resolvedCount =
            feedbacks.filter(function (feedback) {

                return (
                    feedback.status ||
                    "New"
                ) === "Resolved";

            }).length;


        if (newCountElement) {

            newCountElement.textContent =
                newCount;

        }


        if (resolvedCountElement) {

            resolvedCountElement.textContent =
                resolvedCount;

        }

    }


    // =========================================================
    // FILTER
    // =========================================================

    function filterFeedbacks() {

        const searchValue =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "all";


        const selectedType =
            typeFilter
                ? typeFilter.value
                : "all";


        const rows =
            document.querySelectorAll(
                ".feedback-row"
            );


        let visibleCount = 0;


        rows.forEach(function (row) {

            const name =
                (
                    row.dataset.name ||
                    ""
                ).toLowerCase();


            const email =
                (
                    row.dataset.email ||
                    ""
                ).toLowerCase();


            const message =
                (
                    row.dataset.message ||
                    ""
                ).toLowerCase();


            const status =
                row.dataset.status ||
                "New";


            const type =
                row.dataset.type ||
                "General";


            const matchesSearch =
                !searchValue ||
                name.includes(searchValue) ||
                email.includes(searchValue) ||
                message.includes(searchValue);


            const matchesStatus =
                selectedStatus === "all" ||
                status === selectedStatus;


            const matchesType =
                selectedType === "all" ||
                type === selectedType;


            const visible =
                matchesSearch &&
                matchesStatus &&
                matchesType;


            if (visible) {

                row.style.display = "";
                visibleCount++;

            } else {

                row.style.display = "none";

            }

        });


        // =====================================================
        // NO RESULTS
        // =====================================================

        let noResults =
            document.getElementById(
                "feedbackNoResults"
            );


        if (!noResults) {

            noResults =
                document.createElement("div");

            noResults.id =
                "feedbackNoResults";

            noResults.className =
                "feedback-empty-content";

            noResults.innerHTML = `
                <div class="feedback-empty-icon">
                    <i class="bi bi-search"></i>
                </div>

                <h3>
                    No Feedback Found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>
            `;


            if (tableBody && tableBody.parentElement) {

                const tableWrapper =
                    tableBody.parentElement.parentElement;

                if (tableWrapper) {

                    tableWrapper.appendChild(
                        noResults
                    );

                }

            }

        }


        if (noResults) {

            noResults.style.display =
                rows.length > 0 &&
                visibleCount === 0
                    ? "block"
                    : "none";

        }

    }


    // =========================================================
    // SEARCH EVENTS
    // =========================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterFeedbacks
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterFeedbacks
        );

    }


    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            filterFeedbacks
        );

    }


    // =========================================================
    // VIEW FEEDBACK
    // =========================================================

    document
        .querySelectorAll(".feedback-view-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        this.dataset.id;


                    const feedback =
                        getFeedbackById(id);


                    if (!feedback) {

                        alert(
                            "Feedback not found."
                        );

                        return;

                    }


                    if (modalName) {

                        modalName.textContent =
                            feedback.name ||
                            "Anonymous";

                    }


                    if (modalEmail) {

                        modalEmail.textContent =
                            feedback.email ||
                            "No email";

                    }


                    if (modalType) {

                        modalType.textContent =
                            feedback.type ||
                            "General";

                    }


                    if (modalStatus) {

                        modalStatus.textContent =
                            feedback.status ||
                            "New";

                    }


                    if (modalMessage) {

                        modalMessage.textContent =
                            feedback.message ||
                            "No message";

                    }


                    if (viewModal) {

                        viewModal.show();

                    }

                }
            );

        });


    // =========================================================
    // OPEN CHANGE STATUS MODAL
    // =========================================================

    document
        .querySelectorAll(".feedback-status-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        this.dataset.id;


                    const feedback =
                        getFeedbackById(id);


                    if (!feedback) {

                        alert(
                            "Feedback not found."
                        );

                        return;

                    }


                    if (selectedFeedbackId) {

                        selectedFeedbackId.value =
                            id;

                    }


                    if (statusSelect) {

                        statusSelect.value =
                            feedback.status ||
                            "New";

                    }


                    if (statusModal) {

                        statusModal.show();

                    }

                }
            );

        });


    // =========================================================
    // SAVE STATUS
    // =========================================================

    if (saveStatusButton) {

        saveStatusButton.addEventListener(
            "click",
            function () {

                const id =
                    selectedFeedbackId
                        ? selectedFeedbackId.value
                        : "";


                const status =
                    statusSelect
                        ? statusSelect.value
                        : "";


                if (!id) {

                    alert(
                        "Feedback ID is missing."
                    );

                    return;

                }


                if (!status) {

                    alert(
                        "Please select a status."
                    );

                    return;

                }


                // -------------------------------------------------
                // CREATE NORMAL POST FORM
                // -------------------------------------------------
                // This matches Express route:
                // POST /admin/feedback/status/:id
                // -------------------------------------------------

                const form =
                    document.createElement("form");

                form.method =
                    "POST";

                form.action =
                    `/admin/feedback/status/${encodeURIComponent(id)}`;


                const input =
                    document.createElement("input");

                input.type =
                    "hidden";

                input.name =
                    "status";

                input.value =
                    status;


                form.appendChild(input);

                document.body.appendChild(form);


                saveStatusButton.disabled =
                    true;


                saveStatusButton.innerHTML = `
                    <span
                        class="spinner-border spinner-border-sm me-2"
                    ></span>
                    Saving...
                `;


                form.submit();

            }
        );

    }


    // =========================================================
    // OPEN DELETE MODAL
    // =========================================================

    document
        .querySelectorAll(".feedback-delete-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        this.dataset.id;


                    if (deleteFeedbackId) {

                        deleteFeedbackId.value =
                            id;

                    }


                    if (deleteModal) {

                        deleteModal.show();

                    }

                }
            );

        });


    // =========================================================
    // CONFIRM DELETE
    // =========================================================

    if (confirmDeleteButton) {

        confirmDeleteButton.addEventListener(
            "click",
            function () {

                const id =
                    deleteFeedbackId
                        ? deleteFeedbackId.value
                        : "";


                if (!id) {

                    alert(
                        "Feedback ID is missing."
                    );

                    return;

                }


                // -------------------------------------------------
                // CREATE NORMAL POST FORM
                // -------------------------------------------------
                // This matches Express route:
                // POST /admin/feedback/delete/:id
                // -------------------------------------------------

                const form =
                    document.createElement("form");

                form.method =
                    "POST";

                form.action =
                    `/admin/feedback/delete/${encodeURIComponent(id)}`;


                document.body.appendChild(form);


                confirmDeleteButton.disabled =
                    true;


                confirmDeleteButton.innerHTML = `
                    <span
                        class="spinner-border spinner-border-sm me-2"
                    ></span>
                    Deleting...
                `;


                form.submit();

            }
        );

    }


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    updateCounters();

    filterFeedbacks();

});
