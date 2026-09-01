/* =========================================================
   YOGITA PATOLA ART
   HOME PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const yearElement = document.getElementById("currentYear");

    if (yearElement) {

        yearElement.textContent = new Date().getFullYear();

    }


    /* =====================================================
       IMAGE FALLBACK
    ===================================================== */

    const images = document.querySelectorAll("img");

    images.forEach(function (image) {

        image.addEventListener("error", function () {

            image.style.display = "none";

            const parent = image.parentElement;

            if (parent) {

                parent.classList.add("image-placeholder");

            }

        });

    });


    /* =====================================================
       NAVBAR
    ===================================================== */

    const navbar = document.querySelector(".site-header");

    window.addEventListener("scroll", function () {

        if (!navbar) {
            return;
        }

        if (window.scrollY > 30) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    });


    /* =====================================================
       SMOOTH ANCHOR SCROLL
    ===================================================== */

    const anchorLinks = document.querySelectorAll(
        'a[href^="#"]'
    );

    anchorLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId = link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


});