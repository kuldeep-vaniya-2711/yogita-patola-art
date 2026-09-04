
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
   - Body scroll lock
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
        document.querySelectorAll(".admin-sidebar a");


    /* =====================================================
       SAFETY CHECK
       ===================================================== */

    if (!sidebar) {
        return;
    }


    /* =====================================================
       MOBILE BREAKPOINT
       ===================================================== */

    const MOBILE_BREAKPOINT = 991;


    /* =====================================================
       CHECK MOBILE
       ===================================================== */

    function isMobile() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }


    /* =====================================================
       UPDATE ARIA
       ===================================================== */

    function updateAria(isOpen) {

        if (menuToggle) {

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        }

        if (sidebarClose) {

            sidebarClose.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        }

    }


    /* =====================================================
       OPEN SIDEBAR
       ===================================================== */

    function openSidebar() {

        if (!isMobile()) {
            return;
        }


        sidebar.classList.add("show");


        if (overlay) {

            overlay.classList.add("show");
            overlay.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        document.body.classList.add(
            "admin-sidebar-open"
        );


        updateAria(true);

    }


    /* =====================================================
       CLOSE SIDEBAR
       ===================================================== */

    function closeSidebar() {

        sidebar.classList.remove("show");


        if (overlay) {

            overlay.classList.remove("show");
            overlay.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        document.body.classList.remove(
            "admin-sidebar-open"
        );


        updateAria(false);

    }


    /* =====================================================
       TOGGLE SIDEBAR
       ===================================================== */

    function toggleSidebar() {

        if (!isMobile()) {
            return;
        }


        if (
            sidebar.classList.contains("show")
        ) {

            closeSidebar();

        } else {

            openSidebar();

        }

    }


    /* =====================================================
       MOBILE MENU BUTTON
       ===================================================== */

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                toggleSidebar();

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

            if (
                event.key === "Escape" &&
                sidebar.classList.contains("show")
            ) {

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
                     * Do not manually force active class
                     * here for external/new page navigation.
                     *
                     * EJS currentPath + setActiveMenu()
                     * will determine the correct active item
                     * after the new page loads.
                     */

                    if (isMobile()) {

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


        let exactMatch = null;
        let parentMatch = null;


        sidebarLinks.forEach(
            function (link) {

                link.classList.remove("active");


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
                 * Ignore external links
                 */

                if (
                    href.startsWith("http://") ||
                    href.startsWith("https://")
                ) {

                    return;

                }


                /*
                 * Remove query string
                 */

                const cleanHref =
                    href.split("?")[0];


                /*
                 * Remove trailing slash
                 * except root
                 */

                const normalizedHref =
                    cleanHref.length > 1
                        ? cleanHref.replace(/\/+$/, "")
                        : cleanHref;


                const normalizedPath =
                    currentPath.length > 1
                        ? currentPath.replace(/\/+$/, "")
                        : currentPath;


                /* -----------------------------------------
                   EXACT MATCH
                   ----------------------------------------- */

                if (
                    normalizedHref === normalizedPath
                ) {

                    exactMatch = link;

                    return;

                }


                /* -----------------------------------------
                   PARENT / SECTION MATCH
                   ----------------------------------------- */

                if (
                    normalizedHref !== "/admin" &&
                    normalizedPath.startsWith(
                        normalizedHref + "/"
                    )
                ) {

                    /*
                     * Keep the longest matching path.
                     *
                     * Example:
                     *
                     * /admin/products
                     * /admin/products/edit/123
                     *
                     * Products remains active.
                     */

                    if (
                        !parentMatch ||
                        normalizedHref.length >
                        parentMatch.dataset.hrefLength
                    ) {

                        link.dataset.hrefLength =
                            normalizedHref.length;

                        parentMatch = link;

                    }

                }

            }
        );


        /* =================================================
           PRIORITY:
           1. Exact match
           2. Parent match
           3. Dashboard
           ================================================= */

        if (exactMatch) {

            exactMatch.classList.add("active");

        }
        else if (parentMatch) {

            parentMatch.classList.add("active");

        }
        else if (
            normalizedAdminPath(currentPath) === "/admin"
        ) {

            sidebarLinks.forEach(
                function (link) {

                    const href =
                        link.getAttribute("href");


                    if (
                        href === "/admin" ||
                        href === "/admin/"
                    ) {

                        link.classList.add("active");

                    }

                }
            );

        }

    }


    /* =====================================================
       NORMALIZE ADMIN PATH
       ===================================================== */

    function normalizedAdminPath(path) {

        if (!path) {
            return "";
        }


        if (path.length > 1) {

            return path.replace(/\/+$/, "");

        }


        return path;

    }


    /* =====================================================
       WINDOW RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            /*
             * Desktop:
             * Sidebar should always be in normal
             * desktop state.
             */

            if (!isMobile()) {

                closeSidebar();

            }

        }
    );


    /* =====================================================
       BODY SCROLL LOCK
       ===================================================== */

    function updateBodyScroll() {

        if (
            isMobile() &&
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
       SIDEBAR BRAND CLICK
       ===================================================== */

    const sidebarBrand =
        document.querySelector(
            ".admin-sidebar-brand"
        );


    if (sidebarBrand) {

        sidebarBrand.addEventListener(
            "click",
            function () {

                if (isMobile()) {

                    closeSidebar();

                }

            }
        );

    }


    /* =====================================================
       LOGOUT CONFIRMATION
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


                    const isOpen =
                        dropdown.classList.toggle(
                            "show"
                        );


                    toggle.classList.toggle(
                        "open",
                        isOpen
                    );


                    toggle.setAttribute(
                        "aria-expanded",
                        isOpen ? "true" : "false"
                    );

                }
            );

        }
    );


    /* =====================================================
       BOOTSTRAP TOOLTIP
       ===================================================== */

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
       INITIAL STATE
       ===================================================== */

    if (overlay) {

        overlay.classList.remove("show");

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    updateAria(false);

    setActiveMenu();

    updateBodyScroll();

});

