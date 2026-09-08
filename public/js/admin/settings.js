/* =========================================================
   YOGITA PATOLA ART - ADMIN SETTINGS PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const settingsForm = document.getElementById("settingsForm");
    const saveButton = document.getElementById("saveSettingsBtn");
    const switchIds = ["maintenanceMode", "showContact", "showFeedback", "showReviews"];

    function updateSwitchUI(input) {
        if (!input) return;
        const switchWrapper = input.closest(".settings-switch");
        const status = document.querySelector(`.switch-status[data-status-for="${input.id}"]`);
        const statusText = status ? status.querySelector(".switch-status-text") : null;
        const on = input.checked;

        if (switchWrapper) {
            switchWrapper.classList.toggle("is-on", on);
            switchWrapper.classList.toggle("is-off", !on);
        }
        if (status) {
            status.classList.toggle("is-on", on);
            status.classList.toggle("is-off", !on);
        }
        if (statusText) statusText.textContent = on ? "ON" : "OFF";
    }

    switchIds.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        updateSwitchUI(input);
        input.addEventListener("change", () => updateSwitchUI(input));
    });

    function setupImagePreview(inputId, previewId, placeholderId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        const placeholder = document.getElementById(placeholderId);
        if (!input || !preview) return;

        input.addEventListener("change", function () {
            const file = this.files && this.files[0];
            if (!file) return;

            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                this.value = "";
                alert("Please select a JPG, JPEG, PNG or WEBP image.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                this.value = "";
                alert("Image size must be less than 5MB.");
                return;
            }

            preview.src = URL.createObjectURL(file);
            preview.classList.remove("d-none");
            if (placeholder) placeholder.classList.add("d-none");
        });
    }

    setupImagePreview("heroImageFile", "heroImagePreview", "heroImagePlaceholder");
    setupImagePreview("aboutImageFile", "aboutImagePreview", "aboutImagePlaceholder");
    setupImagePreview("faviconFile", "faviconPreview", "faviconPlaceholder");

    if (settingsForm && saveButton) {
        settingsForm.addEventListener("submit", function () {
            saveButton.disabled = true;
            saveButton.classList.add("is-saving");
            const buttonText = saveButton.querySelector("span");
            if (buttonText) buttonText.textContent = "Saving Settings...";
        });
    }

    const alerts = document.querySelectorAll(".settings-alert");
    if (alerts.length) {
        setTimeout(() => {
            alerts.forEach(alert => {
                alert.style.transition = "opacity 0.4s ease";
                alert.style.opacity = "0";
                setTimeout(() => alert.remove(), 400);
            });
        }, 5000);
    }
});