document.addEventListener("DOMContentLoaded", () => {
    const yearElement = document.getElementById("currentYear");
    if (yearElement) yearElement.textContent = new Date().getFullYear();

    const navbar = document.querySelector(".custom-navbar");
    window.addEventListener("scroll", () => {
        if (navbar) navbar.classList.toggle("navbar-scrolled", window.scrollY > 50);
    });

    const navbarCollapse = document.querySelector(".navbar-collapse");
    document.querySelectorAll(".navbar-collapse .nav-link").forEach(link => {
        link.addEventListener("click", () => {
            if (navbarCollapse && navbarCollapse.classList.contains("show")) {
                bootstrap.Collapse.getInstance(navbarCollapse)?.hide();
            }
        });
    });

    document.querySelectorAll(".wishlist-button").forEach(button => {
        button.addEventListener("click", () => {
            const icon = button.querySelector("i");
            if (!icon) return;
            const isFilled = icon.classList.toggle("bi-heart-fill");
            icon.classList.toggle("bi-heart", !isFilled);
            button.classList.toggle("wishlist-active", isFilled);
        });
    });

    const newsletterForm = document.querySelector(".newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector("input");
            if (!emailInput || !emailInput.value.trim()) return;
            alert("Thank you for connecting with Yogita Patola Art.");
            emailInput.value = "";
        });
    }
});