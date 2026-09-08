/* =========================================================
   YOGITA PATOLA ART - HOME PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const yearElement = document.getElementById("currentYear");
    if (yearElement) yearElement.textContent = new Date().getFullYear();

    document.querySelectorAll("img").forEach(image => {
        image.addEventListener("error", () => {
            image.style.display = "none";
            image.parentElement?.classList.add("image-placeholder");
        });
    });

    const navbar = document.querySelector(".site-header");
    window.addEventListener("scroll", () => {
        if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 30);
    });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (!targetId || targetId === "#") return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
});