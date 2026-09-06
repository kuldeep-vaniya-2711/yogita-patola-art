/* =========================================================
   YOGITA PATOLA ART
   ADMIN SETTINGS PAGE
   File:
   public/js/admin/settings.js
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       SETTINGS FORM
    ===================================================== */

    const settingsForm =
        document.getElementById("settingsForm");


    const saveButton =
        document.getElementById("saveSettingsBtn");


    /* =====================================================
       WEBSITE OPTION SWITCHES
    ===================================================== */

    const switchIds = [
        "maintenanceMode",
        "showContact",
        "showFeedback",
        "showReviews"
    ];


    /* =====================================================
       UPDATE SWITCH UI
    ===================================================== */

    function updateSwitchUI(input) {

        if (!input) {
            return;
        }


        const switchWrapper =
            input.closest(".settings-switch");


        const status =
            document.querySelector(
                `.switch-status[data-status-for="${input.id}"]`
            );


        const statusText =
            status
                ? status.querySelector(".switch-status-text")
                : null;


        if (input.checked) {

            if (switchWrapper) {

                switchWrapper.classList.add("is-on");
                switchWrapper.classList.remove("is-off");

            }


            if (status) {

                status.classList.add("is-on");
                status.classList.remove("is-off");

            }


            if (statusText) {

                statusText.textContent = "ON";

            }

        } else {

            if (switchWrapper) {

                switchWrapper.classList.add("is-off");
                switchWrapper.classList.remove("is-on");

            }


            if (status) {

                status.classList.add("is-off");
                status.classList.remove("is-on");

            }


            if (statusText) {

                statusText.textContent = "OFF";

            }

        }

    }


    /* =====================================================
       INITIALIZE SWITCHES
    ===================================================== */

    switchIds.forEach(function (id) {

        const input =
            document.getElementById(id);


        if (!input) {
            return;
        }


        updateSwitchUI(input);


        input.addEventListener(
            "change",
            function () {

                updateSwitchUI(input);

            }
        );

    });


    /* =====================================================
       IMAGE PREVIEW
    ===================================================== */

    function setupImagePreview(
        inputId,
        previewId,
        placeholderId
    ) {

        const input =
            document.getElementById(inputId);


        const preview =
            document.getElementById(previewId);


        const placeholder =
            document.getElementById(placeholderId);


        if (!input || !preview) {
            return;
        }


        input.addEventListener(
            "change",
            function () {

                const file =
                    this.files &&
                    this.files[0];


                if (!file) {
                    return;
                }


                /* -----------------------------------------
                   FILE TYPE VALIDATION
                ----------------------------------------- */

                const allowedTypes = [
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp"
                ];


                if (!allowedTypes.includes(file.type)) {

                    this.value = "";


                    alert(
                        "Please select a JPG, JPEG, PNG or WEBP image."
                    );


                    return;

                }


                /* -----------------------------------------
                   FILE SIZE VALIDATION
                ----------------------------------------- */

                const maxSize =
                    5 * 1024 * 1024;


                if (file.size > maxSize) {

                    this.value = "";


                    alert(
                        "Image size must be less than 5MB."
                    );


                    return;

                }


                /* -----------------------------------------
                   CREATE PREVIEW
                ----------------------------------------- */

                const objectUrl =
                    URL.createObjectURL(file);


                preview.src =
                    objectUrl;


                preview.classList.remove(
                    "d-none"
                );


                if (placeholder) {

                    placeholder.classList.add(
                        "d-none"
                    );

                }

            }
        );

    }


    /* =====================================================
       INITIALIZE IMAGE PREVIEWS
    ===================================================== */

    setupImagePreview(
        "heroImageFile",
        "heroImagePreview",
        "heroImagePlaceholder"
    );


    setupImagePreview(
        "aboutImageFile",
        "aboutImagePreview",
        "aboutImagePlaceholder"
    );


    setupImagePreview(
        "faviconFile",
        "faviconPreview",
        "faviconPlaceholder"
    );


    /* =====================================================
       SAVE BUTTON
    ===================================================== */

    if (settingsForm && saveButton) {

        settingsForm.addEventListener(
            "submit",
            function () {

                saveButton.disabled = true;


                saveButton.classList.add(
                    "is-saving"
                );


                const buttonText =
                    saveButton.querySelector("span");


                if (buttonText) {

                    buttonText.textContent =
                        "Saving Settings...";

                }

            }
        );

    }


    /* =====================================================
       ALERT AUTO HIDE
    ===================================================== */

    const alerts =
        document.querySelectorAll(
            ".settings-alert"
        );


    if (alerts.length) {

        setTimeout(
            function () {

                alerts.forEach(
                    function (alert) {

                        alert.style.transition =
                            "opacity 0.4s ease";


                        alert.style.opacity =
                            "0";


                        setTimeout(
                            function () {

                                alert.remove();

                            },
                            400
                        );

                    }
                );

            },
            5000
        );

    }

});