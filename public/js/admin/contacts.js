// ==================================================
// CONTACT / INQUIRIES MANAGEMENT — ADMIN JS
// ==================================================

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("contactSearch");
    const statusFilter = document.getElementById("statusFilter");
    const refreshButton = document.getElementById("refreshContacts");
    const contactsTable = document.getElementById("contactsTable");
    const noResultsMessage = document.getElementById("noContactResults");
    const deleteForms = document.querySelectorAll(".contact-delete-form");

    function filterContacts() {
        if (!contactsTable) return;
        const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const selectedStatus = statusFilter ? statusFilter.value.trim().toLowerCase() : "all";
        const rows = contactsTable.querySelectorAll("tbody tr.contact-row");
        let visibleRows = 0;

        rows.forEach(row => {
            const rowText = row.innerText.toLowerCase();
            const rowStatus = (row.dataset.status || "").toLowerCase();
            const matchesSearch = !searchValue || rowText.includes(searchValue);
            const matchesStatus = selectedStatus === "all" || rowStatus === selectedStatus;

            if (matchesSearch && matchesStatus) {
                row.style.display = "";
                visibleRows++;
            } else {
                row.style.display = "none";
            }
        });

        if (noResultsMessage) {
            noResultsMessage.style.display = visibleRows === 0 ? "block" : "none";
        }
    }

    if (searchInput) searchInput.addEventListener("input", filterContacts);
    if (statusFilter) statusFilter.addEventListener("change", filterContacts);

    if (refreshButton) {
        refreshButton.addEventListener("click", () => {
            refreshButton.disabled = true;
            refreshButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';
            setTimeout(() => window.location.reload(), 500);
        });
    }

    deleteForms.forEach(form => {
        form.addEventListener("submit", (e) => {
            const contactName = form.dataset.name || "this inquiry";
            if (!window.confirm(`Are you sure you want to delete the inquiry from "${contactName}"?\n\nThis action cannot be undone.`)) {
                e.preventDefault();
                return false;
            }
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
            }
        });
    });

    document.querySelectorAll(".view-contact-btn").forEach(button => {
        button.addEventListener("click", () => {
            const fields = {
                modalContactName: button.dataset.name || "N/A",
                modalContactEmail: button.dataset.email || "N/A",
                modalContactPhone: button.dataset.phone || "N/A",
                modalContactSubject: button.dataset.subject || "N/A",
                modalContactMessage: button.dataset.message || "No message available"
            };
            Object.entries(fields).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            });
        });
    });

    async function handleCopy(button, text, fallbackMsg) {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="bi bi-check-lg"></i> Copied';
            button.classList.add("copied");
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove("copied");
            }, 1500);
        } catch (error) {
            console.error("Copy error:", error);
            window.alert(fallbackMsg);
        }
    }

    document.querySelectorAll(".copy-email-btn").forEach(button => {
        button.addEventListener("click", () => handleCopy(button, button.dataset.email, "Unable to copy email address."));
    });

    document.querySelectorAll(".copy-phone-btn").forEach(button => {
        button.addEventListener("click", () => handleCopy(button, button.dataset.phone, "Unable to copy phone number."));
    });

    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            if (searchInput) { searchInput.focus(); searchInput.select(); }
        } else if (e.key === "Escape" && searchInput && document.activeElement === searchInput) {
            searchInput.value = "";
            filterContacts();
            searchInput.blur();
        }
    });

    filterContacts();
});