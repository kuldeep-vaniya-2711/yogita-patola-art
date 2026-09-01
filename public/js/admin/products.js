/* =========================================================
   ADMIN PRODUCTS PAGE
   Yogita Patola Art
   Search / Filter / Delete Modal / Row Highlight
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initProductFilters();

    initProductDeleteConfirmation();

    initProductRowHighlight();

});


/* =========================================================
   PRODUCT FILTERS
   ========================================================= */

function initProductFilters() {

    const search =
        document.getElementById("productSearch");

    const category =
        document.getElementById("categoryFilter");

    const availability =
        document.getElementById("availabilityFilter");

    const reset =
        document.getElementById("resetFilters");

    const clear =
        document.getElementById("clearFiltersFromEmpty");


    if (
        !search ||
        !category ||
        !availability
    ) {
        return;
    }


    /* -----------------------------------------------------
       APPLY FILTERS
       ----------------------------------------------------- */

    const applyFilters = () => {

        const searchValue =
            search.value
                .toLowerCase()
                .trim();


        const categoryValue =
            category.value
                .toLowerCase()
                .trim();


        const availabilityValue =
            availability.value
                .toLowerCase()
                .trim();


        const rows = [
            ...document.querySelectorAll(
                ".product-row"
            )
        ];


        let visible = 0;


        rows.forEach(row => {

            const name =
                row.dataset.name || "";


            const rowCategory =
                row.dataset.category || "";


            const rowAvailability =
                row.dataset.availability || "";


            /* Search */

            const matchesSearch =
                !searchValue ||
                name.includes(searchValue);


            /* Category */

            const matchesCategory =
                categoryValue === "all" ||
                rowCategory === categoryValue;


            /* Availability */

            const matchesAvailability =
                availabilityValue === "all" ||
                rowAvailability === availabilityValue;


            /* Final result */

            const show =
                matchesSearch &&
                matchesCategory &&
                matchesAvailability;


            row.style.display =
                show ? "" : "none";


            if (show) {
                visible++;
            }

        });


        updateFilterStatus(
            visible,
            rows.length,
            searchValue,
            categoryValue,
            availabilityValue
        );

    };


    /* -----------------------------------------------------
       EVENTS
       ----------------------------------------------------- */

    search.addEventListener(
        "input",
        applyFilters
    );


    category.addEventListener(
        "change",
        applyFilters
    );


    availability.addEventListener(
        "change",
        applyFilters
    );


    /* -----------------------------------------------------
       RESET BUTTON
       ----------------------------------------------------- */

    reset?.addEventListener(
        "click",
        () => {

            search.value = "";

            category.value = "all";

            availability.value = "all";

            applyFilters();

        }
    );


    /* -----------------------------------------------------
       EMPTY STATE CLEAR BUTTON
       ----------------------------------------------------- */

    clear?.addEventListener(
        "click",
        () => {

            search.value = "";

            category.value = "all";

            availability.value = "all";

            applyFilters();

        }
    );


    /* -----------------------------------------------------
       INITIAL FILTER
       ----------------------------------------------------- */

    applyFilters();

}


/* =========================================================
   FILTER RESULT STATUS
   ========================================================= */

function updateFilterStatus(
    visible,
    total,
    search,
    category,
    availability
) {

    const count =
        document.getElementById(
            "visibleProductCount"
        );


    const status =
        document.getElementById(
            "filterStatus"
        );


    const empty =
        document.getElementById(
            "filterEmptyState"
        );


    const table =
        document.getElementById(
            "productsTable"
        );


    /* -----------------------------------------------------
       VISIBLE COUNT
       ----------------------------------------------------- */

    if (count) {

        count.textContent =
            visible;

    }


    /* -----------------------------------------------------
       CHECK FILTER
       ----------------------------------------------------- */

    const filtered =
        Boolean(search) ||
        category !== "all" ||
        availability !== "all";


    /* -----------------------------------------------------
       FILTER STATUS TEXT
       ----------------------------------------------------- */

    if (status) {

        if (!filtered) {

            status.textContent =
                "All products";

        } else {

            status.textContent =
                `${visible} of ${total} products`;

        }

    }


    /* -----------------------------------------------------
       EMPTY STATE
       ----------------------------------------------------- */

    if (empty) {

        empty.style.display =
            filtered && visible === 0
                ? "block"
                : "none";

    }


    /* -----------------------------------------------------
       TABLE VISIBILITY
       ----------------------------------------------------- */

    if (table) {

        table.style.display =
            filtered && visible === 0
                ? "none"
                : "";

    }

}


/* =========================================================
   DELETE CONFIRMATION MODAL
   ========================================================= */

function initProductDeleteConfirmation() {

    const modalElement =
        document.getElementById(
            "deleteProductModal"
        );


    const productNameElement =
        document.getElementById(
            "deleteProductName"
        );


    const confirmButton =
        document.getElementById(
            "confirmDeleteProduct"
        );


    const deleteForms =
        document.querySelectorAll(
            ".delete-product-form"
        );


    /* -----------------------------------------------------
       REQUIRED ELEMENTS CHECK
       ----------------------------------------------------- */

    if (
        !modalElement ||
        !productNameElement ||
        !confirmButton ||
        !deleteForms.length
    ) {
        return;
    }


    /* -----------------------------------------------------
       BOOTSTRAP MODAL
       ----------------------------------------------------- */

    const deleteModal =
        new bootstrap.Modal(
            modalElement
        );


    let selectedForm = null;


    /* -----------------------------------------------------
       DELETE FORM CLICK
       ----------------------------------------------------- */

    deleteForms.forEach(form => {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                selectedForm =
                    form;


                const row =
                    form.closest(
                        ".product-row"
                    );


                const name =
                    row
                        ?.querySelector(
                            ".product-table-details strong"
                        )
                        ?.textContent
                        .trim() ||
                    "this product";


                productNameElement.textContent =
                    name;


                deleteModal.show();

            }
        );

    });


    /* -----------------------------------------------------
       CONFIRM DELETE
       ----------------------------------------------------- */

    confirmButton.addEventListener(
        "click",
        () => {

            if (!selectedForm) {
                return;
            }


            confirmButton.disabled =
                true;


            confirmButton.innerHTML =
                '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Deleting...';


            selectedForm.submit();

        }
    );


    /* -----------------------------------------------------
       MODAL CLOSED
       ----------------------------------------------------- */

    modalElement.addEventListener(
        "hidden.bs.modal",
        () => {

            selectedForm =
                null;


            confirmButton.disabled =
                false;


            confirmButton.textContent =
                "Delete Product";

        }
    );

}


/* =========================================================
   PRODUCT ROW HIGHLIGHT
   ========================================================= */

function initProductRowHighlight() {

    const rows =
        document.querySelectorAll(
            ".product-row"
        );


    if (!rows.length) {
        return;
    }


    rows.forEach(row => {

        row.addEventListener(
            "click",
            event => {

                /* -----------------------------------------
                   Don't select row when clicking actions
                   ----------------------------------------- */

                if (
                    event.target.closest(
                        "a, button, form"
                    )
                ) {
                    return;
                }


                /* -----------------------------------------
                   Remove previous selection
                   ----------------------------------------- */

                rows.forEach(item => {

                    item.classList.remove(
                        "product-row-selected"
                    );

                });


                /* -----------------------------------------
                   Select current row
                   ----------------------------------------- */

                row.classList.add(
                    "product-row-selected"
                );

            }
        );

    });

}


/* =========================================================
   CLEAR PRODUCT SEARCH
   ========================================================= */

function clearProductSearch() {

    const search =
        document.getElementById(
            "productSearch"
        );


    const category =
        document.getElementById(
            "categoryFilter"
        );


    const availability =
        document.getElementById(
            "availabilityFilter"
        );


    if (search) {

        search.value = "";

    }


    if (category) {

        category.value = "all";

    }


    if (availability) {

        availability.value = "all";

    }


    /* -----------------------------------------------------
       Trigger filter
       ----------------------------------------------------- */

    if (search) {

        search.dispatchEvent(
            new Event("input")
        );

    }

}


/* =========================================================
   GLOBAL FUNCTION
   ========================================================= */

window.clearProductSearch =
    clearProductSearch;