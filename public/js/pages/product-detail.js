/* =========================================================
   YOGITA PATOLA ART
   PRODUCT DETAIL PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("Product detail JS loaded.");



    /* =====================================================
       PRODUCT IMAGE GALLERY
       ===================================================== */

    const mainProductImage =
        document.getElementById("mainProductImage");

    const productThumbnails =
        document.querySelectorAll(".product-thumbnail");


    if (
        mainProductImage &&
        productThumbnails.length > 0
    ) {

        productThumbnails.forEach(function (thumbnail) {

            thumbnail.addEventListener(
                "click",
                function () {

                    const imageUrl =
                        this.getAttribute("data-image") ||
                        this.getAttribute("src");

                    if (!imageUrl) {
                        return;
                    }


                    mainProductImage.src =
                        imageUrl;


                    /* Remove active */

                    productThumbnails.forEach(function (item) {

                        item.classList.remove("active");

                    });


                    /* Add active */

                    this.classList.add("active");

                }
            );

        });

    }



    /* =====================================================
       PRODUCT IMAGE ERROR HANDLING
       ===================================================== */

    const productImages =
        document.querySelectorAll(
            ".product-detail-page img"
        );


    productImages.forEach(function (image) {

        image.addEventListener(
            "error",
            function () {

                this.classList.add(
                    "image-load-error"
                );

            }
        );

    });



    /* =====================================================
       QUANTITY CONTROL
       ===================================================== */

    const quantityInput =
        document.getElementById("quantity");

    const quantityMinus =
        document.getElementById("quantityMinus");

    const quantityPlus =
        document.getElementById("quantityPlus");


    if (
        quantityInput &&
        quantityMinus &&
        quantityPlus
    ) {


        quantityMinus.addEventListener(
            "click",
            function () {

                let currentValue =
                    parseInt(
                        quantityInput.value,
                        10
                    ) || 1;


                if (currentValue > 1) {

                    currentValue--;

                }


                quantityInput.value =
                    currentValue;

            }
        );



        quantityPlus.addEventListener(
            "click",
            function () {

                let currentValue =
                    parseInt(
                        quantityInput.value,
                        10
                    ) || 1;


                const maxValue =
                    parseInt(
                        quantityInput.getAttribute("max"),
                        10
                    );


                if (
                    !isNaN(maxValue) &&
                    currentValue >= maxValue
                ) {

                    return;

                }


                currentValue++;


                quantityInput.value =
                    currentValue;

            }
        );



        quantityInput.addEventListener(
            "input",
            function () {

                let value =
                    parseInt(
                        this.value,
                        10
                    );


                if (
                    isNaN(value) ||
                    value < 1
                ) {

                    this.value = 1;

                }


                const maxValue =
                    parseInt(
                        this.getAttribute("max"),
                        10
                    );


                if (
                    !isNaN(maxValue) &&
                    value > maxValue
                ) {

                    this.value =
                        maxValue;

                }

            }
        );

    }



    /* =====================================================
       REVIEW STAR SELECTION
       ===================================================== */

    const reviewRatingInputs =
        document.querySelectorAll(
            'input[name="rating"]'
        );


    const reviewStars =
        document.querySelectorAll(
            ".review-star"
        );


    if (reviewRatingInputs.length > 0) {


        reviewRatingInputs.forEach(
            function (input) {

                input.addEventListener(
                    "change",
                    function () {

                        const selectedRating =
                            parseInt(
                                this.value,
                                10
                            );


                        reviewStars.forEach(
                            function (star) {

                                const starRating =
                                    parseInt(
                                        star.getAttribute(
                                            "data-rating"
                                        ),
                                        10
                                    );


                                if (
                                    starRating <=
                                    selectedRating
                                ) {

                                    star.classList.add(
                                        "active"
                                    );

                                } else {

                                    star.classList.remove(
                                        "active"
                                    );

                                }

                            }
                        );

                    }
                );

            }
        );

    }



    /* =====================================================
       REVIEW STAR CLICK
       ===================================================== */

    if (reviewStars.length > 0) {

        reviewStars.forEach(function (star) {

            star.addEventListener(
                "click",
                function () {

                    const rating =
                        this.getAttribute(
                            "data-rating"
                        );


                    const matchingInput =
                        document.querySelector(
                            `input[name="rating"][value="${rating}"]`
                        );


                    if (matchingInput) {

                        matchingInput.checked =
                            true;


                        matchingInput.dispatchEvent(
                            new Event("change")
                        );

                    }

                }
            );

        });

    }



    /* =====================================================
       WISHLIST BUTTON
       ===================================================== */

    const wishlistButton =
        document.getElementById(
            "wishlistButton"
        );


    if (wishlistButton) {

        wishlistButton.addEventListener(
            "click",
            function () {

                /*
                 * Wishlist actual database operation
                 * server route se handle hoga.
                 *
                 * Yaha sirf UI state handle karenge.
                 */


                const button =
                    this;


                if (
                    button.dataset.loading ===
                    "true"
                ) {

                    return;

                }


                button.dataset.loading =
                    "true";


                setTimeout(
                    function () {

                        button.dataset.loading =
                            "false";

                    },
                    500
                );

            }
        );

    }



    /* =====================================================
       REVIEW FORM VALIDATION
       ===================================================== */

    const reviewForm =
        document.getElementById(
            "reviewForm"
        );


    if (reviewForm) {

        reviewForm.addEventListener(
            "submit",
            function (event) {

                const rating =
                    reviewForm.querySelector(
                        'input[name="rating"]:checked'
                    );


                const message =
                    reviewForm.querySelector(
                        'textarea[name="message"]'
                    );


                if (!rating) {

                    event.preventDefault();


                    showProductDetailMessage(
                        "Please select a rating.",
                        "warning"
                    );


                    return;

                }


                if (
                    message &&
                    message.value.trim().length < 3
                ) {

                    event.preventDefault();


                    showProductDetailMessage(
                        "Please write a little more about your experience.",
                        "warning"
                    );


                    return;

                }

            }
        );

    }



    /* =====================================================
       PRODUCT DETAIL MESSAGE
       ===================================================== */

    function showProductDetailMessage(
        message,
        type = "info"
    ) {

        const existingAlert =
            document.querySelector(
                ".product-detail-js-alert"
            );


        if (existingAlert) {

            existingAlert.remove();

        }


        const alert =
            document.createElement("div");


        alert.className =
            `alert alert-${type} product-detail-js-alert mt-3`;


        alert.setAttribute(
            "role",
            "alert"
        );


        alert.textContent =
            message;


        const reviewFormElement =
            document.getElementById(
                "reviewForm"
            );


        if (reviewFormElement) {

            reviewFormElement.prepend(
                alert
            );

        } else {

            const productPage =
                document.querySelector(
                    ".product-detail-page"
                );


            if (productPage) {

                productPage.prepend(
                    alert
                );

            }

        }


        setTimeout(
            function () {

                if (alert) {

                    alert.remove();

                }

            },
            4000
        );

    }



    /* =====================================================
       SMOOTH SCROLL FOR REVIEW LINK
       ===================================================== */

    const reviewLinks =
        document.querySelectorAll(
            'a[href="#reviews"], a[href="#reviewSection"]'
        );


    reviewLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    this.getAttribute("href");


                const target =
                    document.querySelector(
                        targetId
                    );


                if (target) {

                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });



    /* =====================================================
       BACK TO TOP
       ===================================================== */

    const backToTopButton =
        document.getElementById(
            "backToTop"
        );


    if (backToTopButton) {

        window.addEventListener(
            "scroll",
            function () {

                if (
                    window.scrollY >
                    500
                ) {

                    backToTopButton.classList.add(
                        "show"
                    );

                } else {

                    backToTopButton.classList.remove(
                        "show"
                    );

                }

            }
        );


        backToTopButton.addEventListener(
            "click",
            function () {

                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }



    /* =====================================================
       IMAGE LIGHTBOX
       ===================================================== */

    const galleryImages =
        document.querySelectorAll(
            ".product-gallery img"
        );


    const lightbox =
        document.getElementById(
            "productLightbox"
        );


    const lightboxImage =
        document.getElementById(
            "lightboxImage"
        );


    if (
        galleryImages.length > 0 &&
        lightbox &&
        lightboxImage
    ) {

        galleryImages.forEach(
            function (image) {

                image.addEventListener(
                    "click",
                    function () {

                        lightboxImage.src =
                            this.src;


                        lightbox.classList.add(
                            "show"
                        );


                        document.body.classList.add(
                            "lightbox-open"
                        );

                    }
                );

            }
        );


        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    lightbox ||
                    event.target.classList.contains(
                        "lightbox-close"
                    )
                ) {

                    lightbox.classList.remove(
                        "show"
                    );


                    document.body.classList.remove(
                        "lightbox-open"
                    );

                }

            }
        );

    }



    /* =====================================================
       ESC KEY → CLOSE LIGHTBOX
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                lightbox
            ) {

                lightbox.classList.remove(
                    "show"
                );


                document.body.classList.remove(
                    "lightbox-open"
                );

            }

        }
    );



    /* =====================================================
       FINAL LOG
       ===================================================== */

    console.log(
        "Product detail page initialized successfully."
    );

});