/* =========================================================
   YOGITA PATOLA ART - PRODUCT DETAIL PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    // Product image gallery
    const mainProductImage = document.getElementById("mainProductImage");
    const productThumbnails = document.querySelectorAll(".product-thumbnail");

    if (mainProductImage && productThumbnails.length > 0) {
        productThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener("click", function () {
                const imageUrl = this.getAttribute("data-image") || this.getAttribute("src");
                if (!imageUrl) return;
                mainProductImage.src = imageUrl;
                productThumbnails.forEach(item => item.classList.remove("active"));
                this.classList.add("active");
            });
        });
    }

    // Product image error handling
    document.querySelectorAll(".product-detail-page img").forEach(image => {
        image.addEventListener("error", function () { this.classList.add("image-load-error"); });
    });

    // Quantity control
    const quantityInput = document.getElementById("quantity");
    const quantityMinus = document.getElementById("quantityMinus");
    const quantityPlus = document.getElementById("quantityPlus");

    if (quantityInput && quantityMinus && quantityPlus) {
        quantityMinus.addEventListener("click", () => {
            let val = parseInt(quantityInput.value, 10) || 1;
            if (val > 1) quantityInput.value = val - 1;
        });

        quantityPlus.addEventListener("click", () => {
            let val = parseInt(quantityInput.value, 10) || 1;
            const max = parseInt(quantityInput.getAttribute("max"), 10);
            if (!isNaN(max) && val >= max) return;
            quantityInput.value = val + 1;
        });

        quantityInput.addEventListener("input", function () {
            let val = parseInt(this.value, 10);
            if (isNaN(val) || val < 1) this.value = 1;
            const max = parseInt(this.getAttribute("max"), 10);
            if (!isNaN(max) && val > max) this.value = max;
        });
    }

    // Review stars
    const reviewRatingInputs = document.querySelectorAll('input[name="rating"]');
    const reviewStars = document.querySelectorAll(".review-star");

    if (reviewRatingInputs.length > 0) {
        reviewRatingInputs.forEach(input => {
            input.addEventListener("change", function () {
                const selected = parseInt(this.value, 10);
                reviewStars.forEach(star => {
                    const starRating = parseInt(star.getAttribute("data-rating"), 10);
                    star.classList.toggle("active", starRating <= selected);
                });
            });
        });
    }

    reviewStars.forEach(star => {
        star.addEventListener("click", function () {
            const rating = this.getAttribute("data-rating");
            const match = document.querySelector(`input[name="rating"][value="${rating}"]`);
            if (match) {
                match.checked = true;
                match.dispatchEvent(new Event("change"));
            }
        });
    });

    // Wishlist button UI state
    const wishlistButton = document.getElementById("wishlistButton");
    if (wishlistButton) {
        wishlistButton.addEventListener("click", function () {
            if (this.dataset.loading === "true") return;
            this.dataset.loading = "true";
            setTimeout(() => { this.dataset.loading = "false"; }, 500);
        });
    }

    // Review form validation
    const reviewForm = document.getElementById("reviewForm");
    function showProductDetailMessage(message, type = "info") {
        const existing = document.querySelector(".product-detail-js-alert");
        if (existing) existing.remove();

        const alert = document.createElement("div");
        alert.className = `alert alert-${type} product-detail-js-alert mt-3`;
        alert.setAttribute("role", "alert");
        alert.textContent = message;

        const container = document.getElementById("reviewForm") || document.querySelector(".product-detail-page");
        if (container) container.prepend(alert);
        setTimeout(() => alert?.remove(), 4000);
    }

    if (reviewForm) {
        reviewForm.addEventListener("submit", function (e) {
            const rating = reviewForm.querySelector('input[name="rating"]:checked');
            const message = reviewForm.querySelector('textarea[name="message"]');

            if (!rating) {
                e.preventDefault();
                return showProductDetailMessage("Please select a rating.", "warning");
            }
            if (message && message.value.trim().length < 3) {
                e.preventDefault();
                return showProductDetailMessage("Please write a little more about your experience.", "warning");
            }
        });
    }

    // Smooth scroll for review link
    document.querySelectorAll('a[href="#reviews"], a[href="#reviewSection"]').forEach(link => {
        link.addEventListener("click", function (e) {
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Back to top
    const backToTopButton = document.getElementById("backToTop");
    if (backToTopButton) {
        window.addEventListener("scroll", () => {
            backToTopButton.classList.toggle("show", window.scrollY > 500);
        });
        backToTopButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // Image lightbox
    const galleryImages = document.querySelectorAll(".product-gallery img");
    const lightbox = document.getElementById("productLightbox");
    const lightboxImage = document.getElementById("lightboxImage");

    if (galleryImages.length > 0 && lightbox && lightboxImage) {
        const closeLightbox = () => {
            lightbox.classList.remove("show");
            document.body.classList.remove("lightbox-open");
        };

        galleryImages.forEach(image => {
            image.addEventListener("click", function () {
                lightboxImage.src = this.src;
                lightbox.classList.add("show");
                document.body.classList.add("lightbox-open");
            });
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox || e.target.classList.contains("lightbox-close")) closeLightbox();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lightbox) closeLightbox();
        });
    }
});