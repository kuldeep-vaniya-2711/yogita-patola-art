// ==================================================
// CONTACT / INQUIRIES MANAGEMENT — ADMIN JS
// File:
// public/js/admin/contacts.js
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    // ==================================================
    // ELEMENTS
    // ==================================================

    const searchInput =
        document.getElementById("contactSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const refreshButton =
        document.getElementById("refreshContacts");

    const contactsTable =
        document.getElementById("contactsTable");

    const noResultsMessage =
        document.getElementById("noContactResults");

    const deleteForms =
        document.querySelectorAll(
            ".contact-delete-form"
        );


    // ==================================================
    // SEARCH + FILTER
    // ==================================================

    function filterContacts() {

        if (!contactsTable) {
            return;
        }

        const searchValue =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";

        const selectedStatus =
            statusFilter
                ? statusFilter.value
                    .trim()
                    .toLowerCase()
                : "all";


        const rows =
            contactsTable.querySelectorAll(
                "tbody tr.contact-row"
            );


        let visibleRows = 0;


        rows.forEach(function (row) {

            const rowText =
                row.innerText
                    .toLowerCase();


            const rowStatus =
                (
                    row.dataset.status ||
                    ""
                )
                    .toLowerCase();


            const matchesSearch =
                !searchValue ||
                rowText.includes(
                    searchValue
                );


            const matchesStatus =
                selectedStatus === "all" ||
                rowStatus === selectedStatus;


            if (
                matchesSearch &&
                matchesStatus
            ) {

                row.style.display = "";

                visibleRows++;

            } else {

                row.style.display = "none";

            }

        });


        // ==================================================
        // NO RESULTS MESSAGE
        // ==================================================

        if (noResultsMessage) {

            if (visibleRows === 0) {

                noResultsMessage.style.display =
                    "block";

            } else {

                noResultsMessage.style.display =
                    "none";

            }

        }

    }


    // ==================================================
    // SEARCH EVENT
    // ==================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterContacts
        );

    }


    // ==================================================
    // STATUS FILTER EVENT
    // ==================================================

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterContacts
        );

    }


    // ==================================================
    // REFRESH BUTTON
    // ==================================================

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function () {

                const originalHTML =
                    refreshButton.innerHTML;


                refreshButton.disabled =
                    true;


                refreshButton.innerHTML =
                    `
                    <span
                        class="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                    ></span>

                    Refreshing...
                    `;


                setTimeout(
                    function () {

                        window.location.reload();

                    },
                    500
                );

            }
        );

    }


    // ==================================================
    // DELETE CONFIRMATION
    // ==================================================

    deleteForms.forEach(function (form) {

        form.addEventListener(
            "submit",
            function (event) {

                const contactName =
                    form.dataset.name ||
                    "this inquiry";


                const confirmed =
                    window.confirm(
                        `Are you sure you want to delete the inquiry from "${contactName}"?\n\nThis action cannot be undone.`
                    );


                if (!confirmed) {

                    event.preventDefault();

                    return false;

                }


                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;


                    submitButton.innerHTML =
                        `
                        <span
                            class="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                        ></span>

                        Deleting...
                        `;

                }

            }
        );

    });


    // ==================================================
    // VIEW CONTACT DETAILS
    // ==================================================

    const viewButtons =
        document.querySelectorAll(
            ".view-contact-btn"
        );


    viewButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const name =
                    button.dataset.name ||
                    "N/A";

                const email =
                    button.dataset.email ||
                    "N/A";

                const phone =
                    button.dataset.phone ||
                    "N/A";

                const subject =
                    button.dataset.subject ||
                    "N/A";

                const message =
                    button.dataset.message ||
                    "No message available";


                const modalName =
                    document.getElementById(
                        "modalContactName"
                    );

                const modalEmail =
                    document.getElementById(
                        "modalContactEmail"
                    );

                const modalPhone =
                    document.getElementById(
                        "modalContactPhone"
                    );

                const modalSubject =
                    document.getElementById(
                        "modalContactSubject"
                    );

                const modalMessage =
                    document.getElementById(
                        "modalContactMessage"
                    );


                if (modalName) {

                    modalName.textContent =
                        name;

                }


                if (modalEmail) {

                    modalEmail.textContent =
                        email;

                }


                if (modalPhone) {

                    modalPhone.textContent =
                        phone;

                }


                if (modalSubject) {

                    modalSubject.textContent =
                        subject;

                }


                if (modalMessage) {

                    modalMessage.textContent =
                        message;

                }

            }
        );

    });


    // ==================================================
    // COPY EMAIL
    // ==================================================

    const copyEmailButtons =
        document.querySelectorAll(
            ".copy-email-btn"
        );


    copyEmailButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            async function () {

                const email =
                    button.dataset.email;


                if (!email) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        email
                    );


                    const originalText =
                        button.innerHTML;


                    button.innerHTML =
                        `
                        <i class="bi bi-check-lg"></i>
                        Copied
                        `;


                    button.classList.add(
                        "copied"
                    );


                    setTimeout(
                        function () {

                            button.innerHTML =
                                originalText;

                            button.classList.remove(
                                "copied"
                            );

                        },
                        1500
                    );


                } catch (error) {

                    console.error(
                        "Copy email error:",
                        error
                    );


                    window.alert(
                        "Unable to copy email address."
                    );

                }

            }
        );

    });


    // ==================================================
    // COPY PHONE
    // ==================================================

    const copyPhoneButtons =
        document.querySelectorAll(
            ".copy-phone-btn"
        );


    copyPhoneButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            async function () {

                const phone =
                    button.dataset.phone;


                if (!phone) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        phone
                    );


                    const originalText =
                        button.innerHTML;


                    button.innerHTML =
                        `
                        <i class="bi bi-check-lg"></i>
                        Copied
                        `;


                    button.classList.add(
                        "copied"
                    );


                    setTimeout(
                        function () {

                            button.innerHTML =
                                originalText;

                            button.classList.remove(
                                "copied"
                            );

                        },
                        1500
                    );


                } catch (error) {

                    console.error(
                        "Copy phone error:",
                        error
                    );


                    window.alert(
                        "Unable to copy phone number."
                    );

                }

            }
        );

    });


    // ==================================================
    // KEYBOARD SHORTCUT
    // Ctrl / Cmd + K → Search
    // ==================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();


                if (searchInput) {

                    searchInput.focus();

                    searchInput.select();

                }

            }

        }
    );


    // ==================================================
    // ESC → CLEAR SEARCH
    // ==================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                searchInput &&
                document.activeElement === searchInput
            ) {

                searchInput.value = "";

                filterContacts();

                searchInput.blur();

            }

        }
    );


    // ==================================================
    // INITIAL FILTER
    // ==================================================

    filterContacts();


    // ==================================================
    // CONSOLE
    // ==================================================

    console.log(
        "Admin Contacts JS loaded successfully."
    );

});