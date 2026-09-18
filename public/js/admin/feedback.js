/* =========================================================
   YOGITA PATOLA ART — ADMIN FEEDBACK MANAGEMENT JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const feedbackData =
        window.adminFeedbackData &&
        Array.isArray(window.adminFeedbackData.feedbacks)
            ? window.adminFeedbackData.feedbacks
            : [];

    const searchInput = document.getElementById("feedbackSearch");
    const statusFilter = document.getElementById("feedbackStatusFilter");
    const typeFilter = document.getElementById("feedbackTypeFilter");
    const tableBody = document.getElementById("feedbackTableBody");

    const viewModalEl = document.getElementById("feedbackViewModal");
    const viewModal =
        viewModalEl && window.bootstrap
            ? new bootstrap.Modal(viewModalEl)
            : null;

    const modalName = document.getElementById("modalFeedbackName");
    const modalEmail = document.getElementById("modalFeedbackEmail");
    const modalType = document.getElementById("modalFeedbackType");
    const modalStatus = document.getElementById("modalFeedbackStatus");
    const modalMessage = document.getElementById("modalFeedbackMessage");

    const statusModalEl = document.getElementById("feedbackStatusModal");
    const statusModal =
        statusModalEl && window.bootstrap
            ? new bootstrap.Modal(statusModalEl)
            : null;

    const statusSelect = document.getElementById("feedbackStatusSelect");
    const selectedFeedbackId =
        document.getElementById("selectedFeedbackId");
    const saveStatusButton =
        document.getElementById("saveFeedbackStatusBtn");

    const deleteModalEl = document.getElementById("feedbackDeleteModal");
    const deleteModal =
        deleteModalEl && window.bootstrap
            ? new bootstrap.Modal(deleteModalEl)
            : null;

    const deleteFeedbackId =
        document.getElementById("deleteFeedbackId");
    const confirmDeleteButton =
        document.getElementById("confirmFeedbackDeleteBtn");

    function escapeHTML(value) {
        if (value === null || value === undefined) return "";

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const normalize = value =>
        String(value || "").toLowerCase().trim();

    const getFeedbackStatus = feedback =>
        feedback.status || "New";

    const getFeedbackType = feedback =>
        feedback.type || "General";

    const getFeedbackId = feedback =>
        feedback._id || feedback.id || "";

    function formatDate(dateValue) {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        return Number.isNaN(date.getTime())
            ? "-"
            : date.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
              });
    }

    function getStatusBadge(status) {
        if (status === "Resolved") {
            return `
                <span class="admin-status admin-status-success">
                    <i class="bi bi-check-circle me-1"></i>
                    Resolved
                </span>`;
        }

        if (status === "Read") {
            return `
                <span class="admin-status admin-status-warning">
                    <i class="bi bi-eye me-1"></i>
                    Read
                </span>`;
        }

        return `
            <span class="admin-status admin-status-danger">
                <i class="bi bi-envelope me-1"></i>
                New
            </span>`;
    }

    function showEmptyState(message = "No feedback found.") {
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr id="feedbackEmptyRow">
                <td colspan="8" class="feedback-empty">
                    <div class="feedback-empty-content">
                        <div class="feedback-empty-icon">
                            <i class="bi bi-chat-square-text"></i>
                        </div>
                        <h3>No Feedback Found</h3>
                        <p>${escapeHTML(message)}</p>
                    </div>
                </td>
            </tr>`;
    }

    function renderFeedbacks(list) {
        if (!tableBody) return;

        if (!list.length) {
            showEmptyState("Try changing your search or filter.");
            return;
        }

        tableBody.innerHTML = "";

        list.forEach((feedback, index) => {
            const id = getFeedbackId(feedback);
            const name = feedback.name || "Anonymous";
            const email = feedback.email || "";
            const type = getFeedbackType(feedback);
            const status = getFeedbackStatus(feedback);
            const message = feedback.message || "No message";
            const initial = name.charAt(0).toUpperCase();

            const row = document.createElement("tr");

            row.className = "feedback-row";
            row.dataset.name = name;
            row.dataset.email = email;
            row.dataset.message = message;
            row.dataset.status = status;
            row.dataset.type = type;

            row.innerHTML = `
                <td>
                    <span class="feedback-number">
                        ${index + 1}
                    </span>
                </td>

                <td>
                    <div class="feedback-customer">
                        <div class="feedback-avatar">
                            ${escapeHTML(initial)}
                        </div>
                        <div>
                            <strong>${escapeHTML(name)}</strong>
                        </div>
                    </div>
                </td>

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

                <td>
                    <span class="feedback-type-badge">
                        ${escapeHTML(type)}
                    </span>
                </td>

                <td>
                    <div class="feedback-message">
                        ${escapeHTML(message)}
                    </div>
                </td>

                <td>
                    ${getStatusBadge(status)}
                </td>

                <td>
                    <span class="feedback-date">
                        ${formatDate(feedback.createdAt)}
                    </span>
                </td>

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
                </td>`;
            
            tableBody.appendChild(row);
        });

        attachActionButtons();
    }

    function filterFeedbacks() {
        const search = normalize(searchInput?.value);
        const selectedStatus = statusFilter?.value || "all";
        const selectedType = typeFilter?.value || "all";

        const filtered = feedbackData.filter(feedback => {
            const name = normalize(feedback.name);
            const email = normalize(feedback.email);
            const message = normalize(feedback.message);
            const status = getFeedbackStatus(feedback);
            const type = getFeedbackType(feedback);

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

            return searchMatch && statusMatch && typeMatch;
        });

        renderFeedbacks(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterFeedbacks);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", filterFeedbacks);
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", filterFeedbacks);
    }

    const findFeedbackById = id =>
        feedbackData.find(
            feedback =>
                String(getFeedbackId(feedback)) === String(id)
        );

    function openViewModal(id) {
        const feedback = findFeedbackById(id);

        if (!feedback) {
            alert("Feedback could not be found.");
            return;
        }

        if (modalName) {
            modalName.textContent = feedback.name || "Anonymous";
        }

        if (modalEmail) {
            modalEmail.textContent = feedback.email || "No email";
        }

        if (modalType) {
            modalType.textContent = getFeedbackType(feedback);
        }

        if (modalStatus) {
            modalStatus.textContent = getFeedbackStatus(feedback);
        }

        if (modalMessage) {
            modalMessage.textContent =
                feedback.message || "No message";
        }

        if (viewModal) {
            viewModal.show();
        }
    }

    function openStatusModal(id) {
        const feedback = findFeedbackById(id);

        if (!feedback) {
            alert("Feedback could not be found.");
            return;
        }

        if (selectedFeedbackId) {
            selectedFeedbackId.value = id;
        }

        if (statusSelect) {
            statusSelect.value = getFeedbackStatus(feedback);
        }

        if (statusModal) {
            statusModal.show();
        }
    }

    async function updateFeedbackStatus(id, status) {
        if (!id || !status || !saveStatusButton) return;

        const originalHTML = saveStatusButton.innerHTML;

        saveStatusButton.disabled = true;
        saveStatusButton.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        try {
            const formData = new URLSearchParams();
            formData.append("status", status);

            const response = await fetch(
                `/admin/feedback/status/${encodeURIComponent(id)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to update feedback status."
                );
            }

            window.location.href =
                "/admin/feedback?success=Feedback+status+updated+successfully";
        } catch (error) {
            console.error(
                "Feedback status update error:",
                error
            );

            alert(
                error.message ||
                    "Unable to update feedback status."
            );

            saveStatusButton.disabled = false;
            saveStatusButton.innerHTML = originalHTML;
        }
    }

    function openDeleteModal(id) {
        const feedback = findFeedbackById(id);

        if (!feedback) {
            alert("Feedback could not be found.");
            return;
        }

        if (deleteFeedbackId) {
            deleteFeedbackId.value = id;
        }

        if (deleteModal) {
            deleteModal.show();
        }
    }

    async function deleteFeedback(id) {
        if (!id || !confirmDeleteButton) return;

        const originalHTML = confirmDeleteButton.innerHTML;

        confirmDeleteButton.disabled = true;
        confirmDeleteButton.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

        try {
            const response = await fetch(
                `/admin/feedback/delete/${encodeURIComponent(id)}`,
                {
                    method: "POST"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to delete feedback."
                );
            }

            window.location.href =
                "/admin/feedback?success=Feedback+deleted+successfully";
        } catch (error) {
            console.error(
                "Feedback delete error:",
                error
            );

            alert(
                error.message ||
                    "Unable to delete feedback."
            );

            confirmDeleteButton.disabled = false;
            confirmDeleteButton.innerHTML = originalHTML;
        }
    }

    function attachActionButtons() {
        document
            .querySelectorAll(".feedback-view-btn")
            .forEach(button => {
                button.addEventListener("click", () =>
                    openViewModal(button.dataset.id)
                );
            });

        document
            .querySelectorAll(".feedback-status-btn")
            .forEach(button => {
                button.addEventListener("click", () =>
                    openStatusModal(button.dataset.id)
                );
            });

        document
            .querySelectorAll(".feedback-delete-btn")
            .forEach(button => {
                button.addEventListener("click", () =>
                    openDeleteModal(button.dataset.id)
                );
            });
    }

    if (saveStatusButton) {
        saveStatusButton.addEventListener("click", () => {
            updateFeedbackStatus(
                selectedFeedbackId?.value,
                statusSelect?.value
            );
        });
    }

    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener("click", () => {
            deleteFeedback(deleteFeedbackId?.value);
        });
    }

    function showToast(message, type = "success") {
        let container = document.getElementById(
            "adminFeedbackToastContainer"
        );

        if (!container) {
            container = document.createElement("div");
            container.id = "adminFeedbackToastContainer";
            container.style.cssText =
                "position:fixed;top:20px;right:20px;z-index:9999;";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");

        toast.className = "admin-feedback-toast";

        toast.style.cssText =
            "padding:13px 18px;margin-bottom:10px;border-radius:10px;background:#ffffff;border:1px solid #e7ded4;box-shadow:0 10px 30px rgba(36,27,24,0.12);font-size:14px;color:" +
            (type === "success" ? "#247442" : "#a52b35") +
            ";";

        toast.innerHTML = `
            <i class="bi ${
                type === "success"
                    ? "bi-check-circle"
                    : "bi-exclamation-circle"
            } me-2"></i>
            ${escapeHTML(message)}
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-5px)";
            toast.style.transition = "all 0.25s ease";

            setTimeout(() => toast.remove(), 250);
        }, 3000);
    }

    renderFeedbacks(feedbackData);

    window.adminFeedback = {
        filter: filterFeedbacks,
        view: openViewModal,
        changeStatus: openStatusModal,
        delete: openDeleteModal
    };
});