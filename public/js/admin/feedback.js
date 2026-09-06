/* =========================================================
   YOGITA PATOLA ART
   ADMIN — FEEDBACK MANAGEMENT JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DATA
    ===================================================== */

    const feedbackData =
        window.adminFeedbackData &&
        Array.isArray(window.adminFeedbackData.feedbacks)
            ? window.adminFeedbackData.feedbacks
            : [];


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const searchInput =
        document.getElementById("feedbackSearch");

    const statusFilter =
        document.getElementById("feedbackStatusFilter");

    const typeFilter =
        document.getElementById("feedbackTypeFilter");

    const tableBody =
        document.getElementById("feedbackTableBody");


    /* =====================================================
       VIEW MODAL ELEMENTS
    ===================================================== */

    const viewModalElement =
        document.getElementById("feedbackViewModal");

    const viewModal =
        viewModalElement && window.bootstrap
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


    /* =====================================================
       STATUS MODAL
    ===================================================== */

    const statusModalElement =
        document.getElementById("feedbackStatusModal");

    const statusModal =
        statusModalElement && window.bootstrap
            ? new bootstrap.Modal(statusModalElement)
            : null;

    const statusSelect =
        document.getElementById("feedbackStatusSelect");

    const selectedFeedbackId =
        document.getElementById("selectedFeedbackId");

    const saveStatusButton =
        document.getElementById("saveFeedbackStatusBtn");


    /* =====================================================
       DELETE MODAL
    ===================================================== */

    const deleteModalElement =
        document.getElementById("feedbackDeleteModal");

    const deleteModal =
        deleteModalElement && window.bootstrap
            ? new bootstrap.Modal(deleteModalElement)
            : null;

    const deleteFeedbackId =
        document.getElementById("deleteFeedbackId");

    const confirmDeleteButton =
        document.getElementById(
            "confirmFeedbackDeleteBtn"
        );


    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function normalize(value) {

        return String(value || "")
            .toLowerCase()
            .trim();

    }


    function getFeedbackStatus(feedback) {

        return feedback.status || "New";

    }


    function getFeedbackType(feedback) {

        return feedback.type || "General";

    }


    function getFeedbackId(feedback) {

        return feedback._id ||
            feedback.id ||
            "";

    }


    function formatDate(dateValue) {

        if (!dateValue) {
            return "-";
        }

        const date =
            new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       STATUS BADGE
    ===================================================== */

    function getStatusBadge(status) {

        if (status === "Resolved") {

            return `
                <span class="admin-status admin-status-success">
                    <i class="bi bi-check-circle me-1"></i>
                    Resolved
                </span>
            `;

        }


        if (status === "Read") {

            return `
                <span class="admin-status admin-status-warning">
                    <i class="bi bi-eye me-1"></i>
                    Read
                </span>
            `;

        }


        return `
            <span class="admin-status admin-status-danger">
                <i class="bi bi-envelope me-1"></i>
                New
            </span>
        `;

    }


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    function showEmptyState(message = "No feedback found.") {

        if (!tableBody) {
            return;
        }

        tableBody.innerHTML = `

            <tr id="feedbackEmptyRow">

                <td
                    colspan="8"
                    class="feedback-empty"
                >

                    <div class="feedback-empty-content">

                        <div class="feedback-empty-icon">

                            <i class="bi bi-chat-square-text"></i>

                        </div>

                        <h3>
                            No Feedback Found
                        </h3>

                        <p>
                            ${escapeHTML(message)}
                        </p>

                    </div>

                </td>

            </tr>

        `;

    }


    /* =====================================================
       RENDER TABLE
    ===================================================== */

    function renderFeedbacks(list) {

        if (!tableBody) {
            return;
        }


        if (!list.length) {

            showEmptyState(
                "Try changing your search or filter."
            );

            return;

        }


        tableBody.innerHTML = "";


        list.forEach((feedback, index) => {

            const id =
                getFeedbackId(feedback);

            const name =
                feedback.name || "Anonymous";

            const email =
                feedback.email || "";

            const type =
                getFeedbackType(feedback);

            const status =
                getFeedbackStatus(feedback);

            const message =
                feedback.message || "No message";

            const initial =
                name
                    .charAt(0)
                    .toUpperCase();


            const row =
                document.createElement("tr");


            row.className =
                "feedback-row";


            row.dataset.name =
                name;

            row.dataset.email =
                email;

            row.dataset.message =
                message;

            row.dataset.status =
                status;

            row.dataset.type =
                type;


            row.innerHTML = `

                <!-- NUMBER -->

                <td>

                    <span class="feedback-number">

                        ${index + 1}

                    </span>

                </td>


                <!-- CUSTOMER -->

                <td>

                    <div class="feedback-customer">

                        <div class="feedback-avatar">

                            ${escapeHTML(initial)}

                        </div>

                        <div>

                            <strong>

                                ${escapeHTML(name)}

                            </strong>

                        </div>

                    </div>

                </td>


                <!-- EMAIL -->

                <td>

                    ${
                        email
                            ? `
                                <a
                                    href="mailto:${escapeHTML(email)}"
                                    class="feedback-email"
                                >
                                    ${escapeHTML(email)}
                                </a>
                            `
                            : `
                                <span class="text-muted">
                                    No email
                                </span>
                            `
                    }

                </td>


                <!-- TYPE -->

                <td>

                    <span class="feedback-type-badge">

                        ${escapeHTML(type)}

                    </span>

                </td>


                <!-- MESSAGE -->

                <td>

                    <div class="feedback-message">

                        ${escapeHTML(message)}

                    </div>

                </td>


                <!-- STATUS -->

                <td>

                    ${getStatusBadge(status)}

                </td>


                <!-- DATE -->

                <td>

                    <span class="feedback-date">

                        ${formatDate(feedback.createdAt)}

                    </span>

                </td>


                <!-- ACTIONS -->

                <td>

                    <div class="feedback-actions">


                        <button
                            type="button"
                            class="feedback-action-btn feedback-view-btn"
                            data-id="${escapeHTML(id)}"
                            title="View Feedback"
                        >

                            <i class="bi bi-eye"></i>

                        </button>


                        <button
                            type="button"
                            class="feedback-action-btn feedback-status-btn"
                            data-id="${escapeHTML(id)}"
                            title="Change Status"
                        >

                            <i class="bi bi-arrow-repeat"></i>

                        </button>


                        <button
                            type="button"
                            class="feedback-action-btn feedback-delete-btn"
                            data-id="${escapeHTML(id)}"
                            title="Delete Feedback"
                        >

                            <i class="bi bi-trash"></i>

                        </button>


                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        });


        attachActionButtons();

    }


    /* =====================================================
       FILTER
    ===================================================== */

    function filterFeedbacks() {

        const search =
            normalize(
                searchInput
                    ? searchInput.value
                    : ""
            );


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "all";


        const selectedType =
            typeFilter
                ? typeFilter.value
                : "all";


        const filtered =
            feedbackData.filter((feedback) => {

                const name =
                    normalize(feedback.name);

                const email =
                    normalize(feedback.email);

                const message =
                    normalize(feedback.message);

                const status =
                    getFeedbackStatus(feedback);

                const type =
                    getFeedbackType(feedback);


                const searchMatch =
                    !search ||
                    name.includes(search) ||
                    email.includes(search) ||
                    message.includes(search);


                const statusMatch =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                const typeMatch =
                    selectedType === "all" ||
                    type === selectedType;


                return (
                    searchMatch &&
                    statusMatch &&
                    typeMatch
                );

            });


        renderFeedbacks(filtered);

    }


    /* =====================================================
       SEARCH EVENT
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterFeedbacks
        );

    }


    /* =====================================================
       STATUS FILTER EVENT
    ===================================================== */

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterFeedbacks
        );

    }


    /* =====================================================
       TYPE FILTER EVENT
    ===================================================== */

    if (typeFilter) {

        typeFilter.addEventListener(
            "change",
            filterFeedbacks
        );

    }


    /* =====================================================
       FIND FEEDBACK
    ===================================================== */

    function findFeedbackById(id) {

        return feedbackData.find(
            (feedback) =>
                String(getFeedbackId(feedback)) ===
                String(id)
        );

    }


    /* =====================================================
       VIEW FEEDBACK
    ===================================================== */

    function openViewModal(id) {

        const feedback =
            findFeedbackById(id);


        if (!feedback) {

            alert(
                "Feedback could not be found."
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
                getFeedbackType(feedback);

        }


        if (modalStatus) {

            modalStatus.textContent =
                getFeedbackStatus(feedback);

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


    /* =====================================================
       OPEN STATUS MODAL
    ===================================================== */

    function openStatusModal(id) {

        const feedback =
            findFeedbackById(id);


        if (!feedback) {

            alert(
                "Feedback could not be found."
            );

            return;

        }


        if (selectedFeedbackId) {

            selectedFeedbackId.value =
                id;

        }


        if (statusSelect) {

            statusSelect.value =
                getFeedbackStatus(feedback);

        }


        if (statusModal) {

            statusModal.show();

        }

    }


    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    async function updateFeedbackStatus(
        id,
        status
    ) {

        if (!id || !status) {
            return;
        }


        if (!saveStatusButton) {
            return;
        }


        const originalHTML =
            saveStatusButton.innerHTML;


        saveStatusButton.disabled =
            true;


        saveStatusButton.innerHTML = `

            <span
                class="spinner-border spinner-border-sm me-2"
            ></span>

            Saving...

        `;


        try {

            const response =
                await fetch(
                    `/admin/feedback/${encodeURIComponent(id)}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                status: status
                            })
                    }
                );


            const result =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Unable to update feedback status."
                );

            }


            /*
             * Update local data
             */

            const feedback =
                findFeedbackById(id);


            if (feedback) {

                feedback.status =
                    status;

            }


            /*
             * Close modal
             */

            if (statusModal) {

                statusModal.hide();

            }


            /*
             * Re-render filtered list
             */

            filterFeedbacks();


            /*
             * Success message
             */

            showToast(
                "Feedback status updated successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Feedback status update error:",
                error
            );


            alert(
                error.message ||
                "Unable to update feedback status."
            );

        } finally {

            saveStatusButton.disabled =
                false;

            saveStatusButton.innerHTML =
                originalHTML;

        }

    }


    /* =====================================================
       DELETE FEEDBACK
    ===================================================== */

    function openDeleteModal(id) {

        const feedback =
            findFeedbackById(id);


        if (!feedback) {

            alert(
                "Feedback could not be found."
            );

            return;

        }


        if (deleteFeedbackId) {

            deleteFeedbackId.value =
                id;

        }


        if (deleteModal) {

            deleteModal.show();

        }

    }


    async function deleteFeedback(id) {

        if (!id) {
            return;
        }


        if (!confirmDeleteButton) {
            return;
        }


        const originalHTML =
            confirmDeleteButton.innerHTML;


        confirmDeleteButton.disabled =
            true;


        confirmDeleteButton.innerHTML = `

            <span
                class="spinner-border spinner-border-sm me-2"
            ></span>

            Deleting...

        `;


        try {

            const response =
                await fetch(
                    `/admin/feedback/${encodeURIComponent(id)}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            const result =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Unable to delete feedback."
                );

            }


            /*
             * Remove from local array
             */

            const index =
                feedbackData.findIndex(
                    (feedback) =>
                        String(
                            getFeedbackId(feedback)
                        ) === String(id)
                );


            if (index !== -1) {

                feedbackData.splice(
                    index,
                    1
                );

            }


            /*
             * Close modal
             */

            if (deleteModal) {

                deleteModal.hide();

            }


            /*
             * Re-render
             */

            filterFeedbacks();


            /*
             * Success message
             */

            showToast(
                "Feedback deleted successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Feedback delete error:",
                error
            );


            alert(
                error.message ||
                "Unable to delete feedback."
            );

        } finally {

            confirmDeleteButton.disabled =
                false;

            confirmDeleteButton.innerHTML =
                originalHTML;

        }

    }


    /* =====================================================
       ACTION BUTTONS
    ===================================================== */

    function attachActionButtons() {


        /*
         * VIEW
         */

        document
            .querySelectorAll(
                ".feedback-view-btn"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        openViewModal(
                            button.dataset.id
                        );

                    }
                );

            });


        /*
         * STATUS
         */

        document
            .querySelectorAll(
                ".feedback-status-btn"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        openStatusModal(
                            button.dataset.id
                        );

                    }
                );

            });


        /*
         * DELETE
         */

        document
            .querySelectorAll(
                ".feedback-delete-btn"
            )
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        openDeleteModal(
                            button.dataset.id
                        );

                    }
                );

            });

    }


    /* =====================================================
       SAVE STATUS BUTTON
    ===================================================== */

    if (saveStatusButton) {

        saveStatusButton.addEventListener(
            "click",
            () => {

                const id =
                    selectedFeedbackId
                        ? selectedFeedbackId.value
                        : "";


                const status =
                    statusSelect
                        ? statusSelect.value
                        : "";


                updateFeedbackStatus(
                    id,
                    status
                );

            }
        );

    }


    /* =====================================================
       CONFIRM DELETE BUTTON
    ===================================================== */

    if (confirmDeleteButton) {

        confirmDeleteButton.addEventListener(
            "click",
            () => {

                const id =
                    deleteFeedbackId
                        ? deleteFeedbackId.value
                        : "";


                deleteFeedback(id);

            }
        );

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message,
        type = "success"
    ) {

        let container =
            document.getElementById(
                "adminFeedbackToastContainer"
            );


        if (!container) {

            container =
                document.createElement("div");


            container.id =
                "adminFeedbackToastContainer";


            container.style.position =
                "fixed";

            container.style.top =
                "20px";

            container.style.right =
                "20px";

            container.style.zIndex =
                "9999";


            document.body.appendChild(
                container
            );

        }


        const toast =
            document.createElement("div");


        toast.className =
            "admin-feedback-toast";


        toast.style.padding =
            "13px 18px";

        toast.style.marginBottom =
            "10px";

        toast.style.borderRadius =
            "10px";

        toast.style.background =
            "#ffffff";

        toast.style.border =
            "1px solid #e7ded4";

        toast.style.boxShadow =
            "0 10px 30px rgba(36,27,24,0.12)";

        toast.style.fontSize =
            "14px";

        toast.style.color =
            type === "success"
                ? "#247442"
                : "#a52b35";


        toast.innerHTML = `

            <i class="bi ${
                type === "success"
                    ? "bi-check-circle"
                    : "bi-exclamation-circle"
            } me-2"></i>

            ${escapeHTML(message)}

        `;


        container.appendChild(
            toast
        );


        setTimeout(() => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(-5px)";

            toast.style.transition =
                "all 0.25s ease";


            setTimeout(() => {

                toast.remove();

            }, 250);

        }, 3000);

    }


    /* =====================================================
       INITIAL RENDER
    ===================================================== */

    renderFeedbacks(
        feedbackData
    );


    /* =====================================================
       EXPOSE FUNCTIONS
       Useful for debugging
    ===================================================== */

    window.adminFeedback = {

        filter: filterFeedbacks,

        view: openViewModal,

        changeStatus: openStatusModal,

        delete: openDeleteModal

    };

});