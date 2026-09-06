document.addEventListener(
    "DOMContentLoaded",
    function () {

        const settingsForm =
            document.getElementById(
                "settingsForm"
            );

        const saveButton =
            document.getElementById(
                "saveSettingsBtn"
            );

        const maintenanceMode =
            document.getElementById(
                "maintenanceMode"
            );

        const maintenanceWrapper =
            document.getElementById(
                "maintenanceMessageWrapper"
            );


        // =========================================
        // MAINTENANCE MESSAGE VISIBILITY
        // =========================================

        function updateMaintenanceVisibility() {

            if (
                !maintenanceMode ||
                !maintenanceWrapper
            ) {

                return;

            }


            if (
                maintenanceMode.checked
            ) {

                maintenanceWrapper.style.display =
                    "flex";

            } else {

                maintenanceWrapper.style.display =
                    "none";

            }

        }


        if (maintenanceMode) {

            maintenanceMode.addEventListener(
                "change",
                updateMaintenanceVisibility
            );

            updateMaintenanceVisibility();

        }


        // =========================================
        // FORM SUBMIT
        // =========================================

        if (settingsForm) {

            settingsForm.addEventListener(
                "submit",
                function () {

                    if (!saveButton) {
                        return;
                    }


                    saveButton.disabled =
                        true;


                    saveButton.innerHTML =
                        `
                            <i class="bi bi-arrow-repeat"></i>
                            <span>Saving...</span>
                        `;

                }
            );

        }


        // =========================================
        // AUTO HIDE ALERT
        // =========================================

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

    }
);
