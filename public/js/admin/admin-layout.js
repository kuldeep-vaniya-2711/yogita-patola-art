/* =========================================================
   YOGITA PATOLA ART - ADMIN LAYOUT JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".admin-sidebar");
    const overlay = document.querySelector(".admin-sidebar-overlay");
    const menuToggle = document.querySelector(".admin-menu-toggle");
    const sidebarClose = document.querySelector(".admin-sidebar-close");
    const sidebarLinks = document.querySelectorAll(".admin-sidebar a");
    const sidebarBrand = document.querySelector(".admin-sidebar-brand");
    const logoutLinks = document.querySelectorAll(".admin-logout");
    const dropdownToggles = document.querySelectorAll("[data-admin-dropdown]");

    if (!sidebar) return;

    const MOBILE_BREAKPOINT = 991;
    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    function updateAria(isOpen) {
        const val = isOpen ? "true" : "false";
        if (menuToggle) menuToggle.setAttribute("aria-expanded", val);
        if (sidebarClose) sidebarClose.setAttribute("aria-expanded", val);
    }

    function openSidebar() {
        if (!isMobile()) return;
        sidebar.classList.add("show");
        if (overlay) {
            overlay.classList.add("show");
            overlay.setAttribute("aria-hidden", "false");
        }
        document.body.classList.add("admin-sidebar-open");
        updateAria(true);
    }

    function closeSidebar() {
        sidebar.classList.remove("show");
        if (overlay) {
            overlay.classList.remove("show");
            overlay.setAttribute("aria-hidden", "true");
        }
        document.body.classList.remove("admin-sidebar-open");
        updateAria(false);
    }

    function toggleSidebar() {
        if (!isMobile()) return;
        sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
    }

    if (menuToggle) menuToggle.addEventListener("click", (e) => { e.preventDefault(); toggleSidebar(); });
    if (sidebarClose) sidebarClose.addEventListener("click", (e) => { e.preventDefault(); closeSidebar(); });
    if (overlay) overlay.addEventListener("click", closeSidebar);
    if (sidebarBrand) sidebarBrand.addEventListener("click", () => { if (isMobile()) closeSidebar(); });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("show")) closeSidebar();
    });

    sidebarLinks.forEach(link => {
        link.addEventListener("click", () => { if (isMobile()) closeSidebar(); });
    });

    function setActiveMenu() {
        const currentPath = window.location.pathname;
        const norm = p => (p && p.length > 1 ? p.replace(/\/+$/, "") : (p || ""));
        const normalizedPath = norm(currentPath);

        let exactMatch = null;
        let parentMatch = null;
        let parentLen = 0;

        sidebarLinks.forEach(link => {
            link.classList.remove("active");
            const href = link.getAttribute("href");
            if (!href || href === "#" || href.startsWith("javascript:") || href.startsWith("http://") || href.startsWith("https://")) return;

            const normalizedHref = norm(href.split("?")[0]);
            if (normalizedHref === normalizedPath) {
                exactMatch = link;
            } else if (normalizedHref !== "/admin" && normalizedPath.startsWith(normalizedHref + "/")) {
                if (!parentMatch || normalizedHref.length > parentLen) {
                    parentLen = normalizedHref.length;
                    parentMatch = link;
                }
            }
        });

        if (exactMatch) exactMatch.classList.add("active");
        else if (parentMatch) parentMatch.classList.add("active");
        else if (normalizedPath === "/admin") {
            sidebarLinks.forEach(link => {
                const href = link.getAttribute("href");
                if (href === "/admin" || href === "/admin/") link.classList.add("active");
            });
        }
    }

    function updateBodyScroll() {
        document.body.classList.toggle("admin-sidebar-open", isMobile() && sidebar.classList.contains("show"));
    }

    window.addEventListener("resize", () => {
        if (!isMobile()) closeSidebar();
        updateBodyScroll();
    });

    logoutLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            if (!window.confirm("Are you sure you want to logout?")) e.preventDefault();
        });
    });

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            const target = toggle.getAttribute("data-admin-dropdown");
            const dropdown = target ? document.querySelector(target) : null;
            if (!dropdown) return;
            const isOpen = dropdown.classList.toggle("show");
            toggle.classList.toggle("open", isOpen);
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    });

    if (typeof bootstrap !== "undefined") {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
    }

    if (overlay) {
        overlay.classList.remove("show");
        overlay.setAttribute("aria-hidden", "true");
    }
    updateAria(false);
    setActiveMenu();
    updateBodyScroll();
});
