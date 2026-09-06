/* =========================================================
   YOGITA PATOLA ART
   ADMIN LAYOUT JAVASCRIPT

   File:
   public/js/admin/admin-layout.js

   Purpose:
   - Mobile sidebar toggle
   - Sidebar overlay
   - Close sidebar
   - Escape key support
   - Active menu handling
   - Responsive sidebar behavior
   ========================================================= */


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const sidebar =
        document.querySelector(".admin-sidebar");

    const overlay =
        document.querySelector(".admin-sidebar-overlay");

    const menuToggle =
        document.querySelector(".admin-menu-toggle");

    const sidebarClose =
        document.querySelector(".admin-sidebar-close");

    const sidebarLinks =
        document.querySelectorAll(
            ".admin-sidebar a"
        );


    /* =====================================================
       SAFETY CHECK
       ===================================================== */

    if (!sidebar) {
        return;
    }


    /* =====================================================
       OPEN SIDEBAR
       ===================================================== */

    function openSidebar() {

        sidebar.classList.add(
            "show"
        );


        if (overlay) {

            overlay.classList.add(
                "show"
            );

        }


        document.body.classList.add(
            "admin-sidebar-open"
        );

    }


    /* =====================================================
       CLOSE SIDEBAR
       ===================================================== */

    function closeSidebar() {

        sidebar.classList.remove(
            "show"
        );


        if (overlay) {

            overlay.classList.remove(
                "show"
            );

        }


        document.body.classList.remove(
            "admin-sidebar-open"
        );

    }


    /* =====================================================
       MOBILE MENU BUTTON
       ===================================================== */

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openSidebar();

            }
        );

    }


    /* =====================================================
       SIDEBAR CLOSE BUTTON
       ===================================================== */

    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                closeSidebar();

            }
        );

    }


    /* =====================================================
       OVERLAY CLICK
       ===================================================== */

    if (overlay) {

        overlay.addEventListener(
            "click",
            function () {

                closeSidebar();

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeSidebar();

            }

        }
    );


    /* =====================================================
       SIDEBAR LINK CLICK
       ===================================================== */

    sidebarLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    /*
                     * Active menu handling
                     */

                    sidebarLinks.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    link.classList.add(
                        "active"
                    );


                    /*
                     * Mobile par
                     * sidebar automatically close
                     */

                    if (
                        window.innerWidth <= 991
                    ) {

                        closeSidebar();

                    }

                }
            );

        }
    );


    /* =====================================================
       ACTIVE MENU ON PAGE LOAD
       ===================================================== */

    function setActiveMenu() {

        const currentPath =
            window.location.pathname;


        let activeFound = false;


        sidebarLinks.forEach(
            function (link) {

                const href =
                    link.getAttribute("href");


                if (
                    !href ||
                    href === "#" ||
                    href.startsWith("javascript:")
                ) {

                    return;

                }


                /*
                 * Remove query string
                 */

                const cleanHref =
                    href.split("?")[0];


                /*
                 * Exact match
                 */

                if (
                    cleanHref === currentPath
                ) {

                    link.classList.add(
                        "active"
                    );

                    activeFound = true;

                    return;

                }


                /*
                 * Admin section match
                 *
                 * Example:
                 *
                 * /admin/products
                 * /admin/products/edit/123
                 *
                 * dono par Products menu active rahega.
                 */

                if (
                    cleanHref !== "/admin" &&
                    currentPath.startsWith(
                        cleanHref + "/"
                    )
                ) {

                    link.classList.add(
                        "active"
                    );

                    activeFound = true;

                }

            }
        );


        /*
         * Dashboard fallback
         */

        if (
            !activeFound &&
            currentPath === "/admin"
        ) {

            sidebarLinks.forEach(
                function (link) {

                    const href =
                        link.getAttribute("href");


                    if (
                        href === "/admin" ||
                        href === "/admin/"
                    ) {

                        link.classList.add(
                            "active"
                        );

                    }

                }
            );

        }

    }


    setActiveMenu();


    /* =====================================================
       WINDOW RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            /*
             * Desktop par
             * mobile sidebar state reset karein
             */

            if (
                window.innerWidth > 991
            ) {

                closeSidebar();

            }

        }
    );


    /* =====================================================
       PREVENT BODY SCROLL ON MOBILE SIDEBAR
       ===================================================== */

    function updateBodyScroll() {

        if (
            window.innerWidth <= 991 &&
            sidebar.classList.contains("show")
        ) {

            document.body.classList.add(
                "admin-sidebar-open"
            );

        } else {

            document.body.classList.remove(
                "admin-sidebar-open"
            );

        }

    }


    window.addEventListener(
        "resize",
        updateBodyScroll
    );


    /* =====================================================
       SIDEBAR LOGO / BRAND CLICK
       ===================================================== */

    const sidebarBrand =
        document.querySelector(
            ".admin-sidebar-brand"
        );


    if (sidebarBrand) {

        sidebarBrand.addEventListener(
            "click",
            function () {

                if (
                    window.innerWidth <= 991
                ) {

                    closeSidebar();

                }

            }
        );

    }


    /* =====================================================
       ADMIN LOGOUT CONFIRMATION
       ===================================================== */

    const logoutLinks =
        document.querySelectorAll(
            ".admin-logout"
        );


    logoutLinks.forEach(
        function (logoutLink) {

            logoutLink.addEventListener(
                "click",
                function (event) {

                    const confirmed =
                        window.confirm(
                            "Are you sure you want to logout?"
                        );


                    if (!confirmed) {

                        event.preventDefault();

                    }

                }
            );

        }
    );


    /* =====================================================
       ADMIN SIDEBAR DROPDOWN SUPPORT
       ===================================================== */

    const dropdownToggles =
        document.querySelectorAll(
            "[data-admin-dropdown]"
        );


    dropdownToggles.forEach(
        function (toggle) {

            toggle.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const targetSelector =
                        toggle.getAttribute(
                            "data-admin-dropdown"
                        );


                    if (!targetSelector) {
                        return;
                    }


                    const dropdown =
                        document.querySelector(
                            targetSelector
                        );


                    if (!dropdown) {
                        return;
                    }


                    dropdown.classList.toggle(
                        "show"
                    );


                    toggle.classList.toggle(
                        "open"
                    );

                }
            );

        }
    );


    /* =====================================================
       INITIALIZE TOOLTIP
       ===================================================== */

    /*
     * Bootstrap available ho to
     * Bootstrap tooltips initialize karenge.
     */

    if (
        typeof bootstrap !== "undefined"
    ) {

        const tooltipElements =
            document.querySelectorAll(
                '[data-bs-toggle="tooltip"]'
            );


        tooltipElements.forEach(
            function (element) {

                new bootstrap.Tooltip(
                    element
                );

            }
        );

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    updateBodyScroll();


});