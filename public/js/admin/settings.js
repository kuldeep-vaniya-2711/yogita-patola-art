/* =========================================================
   YOGITA PATOLA ART - ADMIN SETTINGS PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       SETTINGS FORM
    ===================================================== */

    const settingsForm = document.getElementById("settingsForm");
    const saveButton = document.getElementById("saveSettingsBtn");



    /* =====================================================
       WEBSITE STATUS SWITCHES
    ===================================================== */

    const switchIds = [
        "maintenanceMode",
        "showContact",
        "showFeedback",
        "showReviews"
    ];

    function updateSwitchUI(input) {

        if (!input) return;

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

        const on = input.checked;


        /* Switch wrapper */

        if (switchWrapper) {

            switchWrapper.classList.toggle(
                "is-on",
                on
            );

            switchWrapper.classList.toggle(
                "is-off",
                !on
            );
        }


        /* Optional status */

        if (status) {

            status.classList.toggle(
                "is-on",
                on
            );

            status.classList.toggle(
                "is-off",
                !on
            );
        }


        /* ON / OFF text */

        if (statusText) {

            statusText.textContent =
                on ? "ON" : "OFF";
        }
    }


    /* Initialize switches */

    switchIds.forEach(function (id) {

        const input =
            document.getElementById(id);

        if (!input) return;


        /* Set initial UI state */

        updateSwitchUI(input);


        /* Update UI when clicked */

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


        if (!input || !preview) return;


        input.addEventListener(
            "change",
            function () {

                const file =
                    this.files && this.files[0];

                if (!file) return;


                /* Allowed image types */

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


                /* Maximum 5MB */

                if (
                    file.size >
                    5 * 1024 * 1024
                ) {

                    this.value = "";

                    alert(
                        "Image size must be less than 5MB."
                    );

                    return;
                }


                /* Show preview */

                preview.src =
                    URL.createObjectURL(file);

                preview.classList.remove(
                    "d-none"
                );


                /* Hide placeholder */

                if (placeholder) {

                    placeholder.classList.add(
                        "d-none"
                    );
                }
            }
        );
    }



    /* =====================================================
       IMAGE PREVIEWS
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
        "aboutStoryImageFile",
        "aboutStoryImagePreview",
        "aboutStoryImagePreviewPlaceholder"
    );


    setupImagePreview(
        "faviconFile",
        "faviconPreview",
        "faviconPlaceholder"
    );


    setupImagePreview(
        "heritageHandcraftedImageFile",
        "heritageHandcraftedImagePreview",
        "heritageHandcraftedImagePlaceholder"
    );


    setupImagePreview(
        "heritageIntricateImageFile",
        "heritageIntricateImagePreview",
        "heritageIntricateImagePlaceholder"
    );


    setupImagePreview(
        "heritageTimelessImageFile",
        "heritageTimelessImagePreview",
        "heritageTimelessImagePlaceholder"
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
                    saveButton.querySelector(
                        "span"
                    );


                if (buttonText) {

                    buttonText.textContent =
                        "Saving Settings...";
                }
            }
        );
    }



    /* =====================================================
       SETTINGS ALERTS
    ===================================================== */

    const alerts =
        document.querySelectorAll(
            ".settings-alert"
        );


    if (alerts.length) {

        setTimeout(function () {

            alerts.forEach(function (alert) {

                alert.style.transition =
                    "opacity 0.4s ease";

                alert.style.opacity = "0";


                setTimeout(function () {

                    alert.remove();

                }, 400);

            });

        }, 5000);
    }

});