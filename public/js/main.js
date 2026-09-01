document.addEventListener("DOMContentLoaded", () => {

    // Current year
    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // Navbar shadow while scrolling
    const navbar = document.querySelector(".custom-navbar");

    window.addEventListener("scroll", () => {

        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add("navbar-scrolled");
        } else {
            navbar.classList.remove("navbar-scrolled");
        }

    });


    // Close mobile navbar after clicking a link
    const navLinks = document.querySelectorAll(
        ".navbar-collapse .nav-link"
    );

    const navbarCollapse = document.querySelector(
        ".navbar-collapse"
    );

    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            if (
                navbarCollapse &&
                navbarCollapse.classList.contains("show")
            ) {

                const bootstrapCollapse =
                    bootstrap.Collapse.getInstance(navbarCollapse);

                if (bootstrapCollapse) {
                    bootstrapCollapse.hide();
                }

            }

        });

    });


    // Wishlist button demo
    const wishlistButtons =
        document.querySelectorAll(".wishlist-button");

    wishlistButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const icon = button.querySelector("i");

            if (!icon) return;

            if (icon.classList.contains("bi-heart")) {

                icon.classList.remove("bi-heart");
                icon.classList.add("bi-heart-fill");

                button.classList.add("wishlist-active");

            } else {

                icon.classList.remove("bi-heart-fill");
                icon.classList.add("bi-heart");

                button.classList.remove("wishlist-active");

            }

        });

    });


    // Newsletter demo
    const newsletterForm =
        document.querySelector(".newsletter-form");

    if (newsletterForm) {

        newsletterForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const emailInput =
                newsletterForm.querySelector("input");

            if (!emailInput || !emailInput.value.trim()) {
                return;
            }

            alert(
                "Thank you for connecting with Yogita Patola Art."
            );

            emailInput.value = "";

        });

    }

});