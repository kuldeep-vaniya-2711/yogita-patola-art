/* =========================================================
   YOGITA PATOLA ART - PRODUCT DETAIL PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       PRODUCT IMAGE GALLERY
    ===================================================== */

    const mainProductImage =
        document.getElementById("mainProductImage");

    const productThumbnails = Array.from(
        document.querySelectorAll(".product-thumbnail")
    );


    const lightbox =
        document.getElementById("productLightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");


    const galleryImages =
        productThumbnails
            .map(thumbnail => ({
                src: thumbnail.getAttribute("data-image"),
                alt:
                    thumbnail
                        .querySelector("img")
                        ?.getAttribute("alt") || ""
            }))
            .filter(image => image.src);


    if (
        mainProductImage &&
        galleryImages.length === 0 &&
        mainProductImage.getAttribute("src")
    ) {

        galleryImages.push({
            src: mainProductImage.getAttribute("src"),
            alt:
                mainProductImage.getAttribute("alt") || ""
        });

    }


    let currentImageIndex = 0;



    /* =====================================================
       CREATE GALLERY NAVIGATION
    ===================================================== */

    const productMainImageWrapper =
        document.getElementById(
            "productMainImageWrapper"
        );


    let previousButton = null;
    let nextButton = null;


    if (
        productMainImageWrapper &&
        mainProductImage &&
        galleryImages.length > 1
    ) {

        previousButton =
            document.createElement("button");

        previousButton.type = "button";

        previousButton.className =
            "product-gallery-arrow product-gallery-prev";

        previousButton.setAttribute(
            "aria-label",
            "Previous product image"
        );

        previousButton.innerHTML =
            "&#10094;";


        nextButton =
            document.createElement("button");

        nextButton.type = "button";

        nextButton.className =
            "product-gallery-arrow product-gallery-next";

        nextButton.setAttribute(
            "aria-label",
            "Next product image"
        );

        nextButton.innerHTML =
            "&#10095;";


        productMainImageWrapper.appendChild(
            previousButton
        );

        productMainImageWrapper.appendChild(
            nextButton
        );

    }



    /* =====================================================
       SHOW PRODUCT IMAGE
    ===================================================== */

    function showProductImage(index) {

        if (
            !mainProductImage ||
            galleryImages.length === 0
        ) {
            return;
        }


        currentImageIndex =
            (
                index +
                galleryImages.length
            ) %
            galleryImages.length;


        const image =
            galleryImages[currentImageIndex];


        if (!image?.src) {
            return;
        }


        mainProductImage.src =
            image.src;

        mainProductImage.dataset.index =
            currentImageIndex;


        if (image.alt) {

            mainProductImage.alt =
                image.alt;

        }


        productThumbnails.forEach(
            (thumbnail, thumbnailIndex) => {

                thumbnail.classList.toggle(
                    "active",
                    thumbnailIndex ===
                        currentImageIndex
                );

            }
        );


        const activeThumbnail =
            productThumbnails[
                currentImageIndex
            ];


        if (activeThumbnail) {

            activeThumbnail.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });

        }

    }



    /* =====================================================
       THUMBNAIL CLICK
    ===================================================== */

    productThumbnails.forEach(
        (thumbnail, index) => {

            thumbnail.addEventListener(
                "click",
                function () {

                    showProductImage(index);

                }
            );

        }
    );



    /* =====================================================
       PREVIOUS / NEXT BUTTONS
    ===================================================== */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                showProductImage(
                    currentImageIndex - 1
                );

            }
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                showProductImage(
                    currentImageIndex + 1
                );

            }
        );

    }



    /* =====================================================
       PRODUCT IMAGE ERROR HANDLING
    ===================================================== */

    document
        .querySelectorAll(
            ".product-detail-page img"
        )
        .forEach(image => {

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
        document.getElementById(
            "quantity"
        );

    const quantityMinus =
        document.getElementById(
            "quantityMinus"
        );

    const quantityPlus =
        document.getElementById(
            "quantityPlus"
        );


    if (
        quantityInput &&
        quantityMinus &&
        quantityPlus
    ) {


        quantityMinus.addEventListener(
            "click",
            () => {

                const value =
                    parseInt(
                        quantityInput.value,
                        10
                    ) || 1;


                if (value > 1) {

                    quantityInput.value =
                        value - 1;

                }

            }
        );


        quantityPlus.addEventListener(
            "click",
            () => {

                const value =
                    parseInt(
                        quantityInput.value,
                        10
                    ) || 1;


                const max =
                    parseInt(
                        quantityInput.getAttribute(
                            "max"
                        ),
                        10
                    );


                if (
                    !isNaN(max) &&
                    value >= max
                ) {
                    return;
                }


                quantityInput.value =
                    value + 1;

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

                    value = 1;

                }


                const max =
                    parseInt(
                        this.getAttribute(
                            "max"
                        ),
                        10
                    );


                if (
                    !isNaN(max) &&
                    value > max
                ) {

                    value = max;

                }


                this.value = value;

            }
        );

    }



    /* =====================================================
       REVIEW STARS
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
            input => {

                input.addEventListener(
                    "change",
                    function () {

                        const selected =
                            parseInt(
                                this.value,
                                10
                            );


                        reviewStars.forEach(
                            star => {

                                const starRating =
                                    parseInt(
                                        star.getAttribute(
                                            "data-rating"
                                        ),
                                        10
                                    );


                                star.classList.toggle(
                                    "active",
                                    starRating <=
                                        selected
                                );

                            }
                        );

                    }
                );

            }
        );

    }


    reviewStars.forEach(
        star => {

            star.addEventListener(
                "click",
                function () {

                    const rating =
                        this.getAttribute(
                            "data-rating"
                        );


                    const match =
                        document.querySelector(
                            `input[name="rating"][value="${rating}"]`
                        );


                    if (match) {

                        match.checked = true;

                        match.dispatchEvent(
                            new Event("change")
                        );

                    }

                }
            );

        }
    );



    /* =====================================================
       WISHLIST BUTTON UI STATE
    ===================================================== */

    const wishlistButton =
        document.getElementById(
            "wishlistButton"
        );


    if (wishlistButton) {

        wishlistButton.addEventListener(
            "click",
            function () {

                if (
                    this.dataset.loading ===
                    "true"
                ) {
                    return;
                }


                this.dataset.loading =
                    "true";


                setTimeout(() => {

                    this.dataset.loading =
                        "false";

                }, 500);

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


    function showProductDetailMessage(
        message,
        type = "info"
    ) {

        const existing =
            document.querySelector(
                ".product-detail-js-alert"
            );


        if (existing) {
            existing.remove();
        }


        const alert =
            document.createElement(
                "div"
            );


        alert.className =
            `alert alert-${type} product-detail-js-alert mt-3`;


        alert.setAttribute(
            "role",
            "alert"
        );


        alert.textContent =
            message;


        const container =
            document.getElementById(
                "reviewForm"
            ) ||
            document.querySelector(
                ".product-detail-page"
            );


        if (container) {

            container.prepend(
                alert
            );

        }


        setTimeout(() => {

            alert?.remove();

        }, 4000);

    }


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
                    message.value.trim()
                        .length < 3
                ) {

                    event.preventDefault();


                    showProductDetailMessage(
                        "Please write a little more about your experience.",
                        "warning"
                    );

                }

            }
        );

    }



    /* =====================================================
       SMOOTH SCROLL FOR REVIEW LINK
    ===================================================== */

    document
        .querySelectorAll(
            'a[href="#reviews"], a[href="#reviewSection"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                function (event) {

                    const target =
                        document.querySelector(
                            this.getAttribute(
                                "href"
                            )
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
            () => {

                backToTopButton.classList.toggle(
                    "show",
                    window.scrollY > 500
                );

            }
        );


        backToTopButton.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }



    /* =====================================================
       PRODUCT INFORMATION TABS
    ===================================================== */

    const productInfoTabs =
        Array.from(
            document.querySelectorAll(
                ".product-info-tab"
            )
        );


    const productInfoPanels =
        Array.from(
            document.querySelectorAll(
                ".product-info-panel"
            )
        );


    function activateProductInfoTab(
        tab
    ) {

        if (!tab) {
            return;
        }


        const selectedTab =
            tab.getAttribute(
                "data-tab"
            );


        productInfoTabs.forEach(
            currentTab => {

                const isActive =
                    currentTab === tab;


                currentTab.classList.toggle(
                    "active",
                    isActive
                );


                currentTab.setAttribute(
                    "aria-selected",
                    isActive
                        ? "true"
                        : "false"
                );

            }
        );


        productInfoPanels.forEach(
            panel => {

                const isActive =
                    panel.getAttribute(
                        "data-panel"
                    ) === selectedTab;


                panel.classList.toggle(
                    "active",
                    isActive
                );


                panel.hidden =
                    !isActive;

            }
        );

    }


    productInfoTabs.forEach(
        (tab, index) => {

            tab.addEventListener(
                "click",
                function () {

                    activateProductInfoTab(
                        this
                    );

                }
            );


            tab.addEventListener(
                "keydown",
                function (event) {

                    let nextIndex =
                        null;


                    if (
                        event.key ===
                        "ArrowRight"
                    ) {

                        nextIndex =
                            index + 1;

                    }


                    if (
                        event.key ===
                        "ArrowLeft"
                    ) {

                        nextIndex =
                            index - 1;

                    }


                    if (
                        event.key ===
                        "Home"
                    ) {

                        nextIndex = 0;

                    }


                    if (
                        event.key ===
                        "End"
                    ) {

                        nextIndex =
                            productInfoTabs.length - 1;

                    }


                    if (
                        nextIndex === null ||
                        productInfoTabs.length === 0
                    ) {
                        return;
                    }


                    event.preventDefault();


                    if (
                        nextIndex < 0
                    ) {

                        nextIndex =
                            productInfoTabs.length - 1;

                    }


                    if (
                        nextIndex >=
                        productInfoTabs.length
                    ) {

                        nextIndex = 0;

                    }


                    const nextTab =
                        productInfoTabs[
                            nextIndex
                        ];


                    nextTab.focus();

                    activateProductInfoTab(
                        nextTab
                    );

                }
            );

        }
    );



    /* =====================================================
       LIGHTBOX
    ===================================================== */

    if (
        lightbox &&
        lightboxImage &&
        galleryImages.length > 0
    ) {

        let lightboxPreviousButton =
            null;

        let lightboxNextButton =
            null;

        let fullscreenButton =
            null;


        const lightboxDialog =
            lightbox.querySelector(
                ".lightbox-dialog"
            );


        /* -------------------------------------------------
           LIGHTBOX CONTROLS
        ------------------------------------------------- */

        if (
            galleryImages.length > 1 &&
            lightboxDialog
        ) {

            lightboxPreviousButton =
                document.createElement(
                    "button"
                );


            lightboxPreviousButton.type =
                "button";


            lightboxPreviousButton.className =
                "lightbox-nav lightbox-prev";


            lightboxPreviousButton.setAttribute(
                "aria-label",
                "Previous product image"
            );


            lightboxPreviousButton.innerHTML =
                "&#10094;";


            lightboxNextButton =
                document.createElement(
                    "button"
                );


            lightboxNextButton.type =
                "button";


            lightboxNextButton.className =
                "lightbox-nav lightbox-next";


            lightboxNextButton.setAttribute(
                "aria-label",
                "Next product image"
            );


            lightboxNextButton.innerHTML =
                "&#10095;";


            lightbox.appendChild(
                lightboxPreviousButton
            );


            lightbox.appendChild(
                lightboxNextButton
            );

        }



        /* -------------------------------------------------
           FULLSCREEN BUTTON
        ------------------------------------------------- */

        if (lightboxDialog) {

            fullscreenButton =
                document.createElement(
                    "button"
                );


            fullscreenButton.type =
                "button";


            fullscreenButton.className =
                "lightbox-fullscreen";


            fullscreenButton.setAttribute(
                "aria-label",
                "View image in fullscreen"
            );


            fullscreenButton.innerHTML =
                "&#x26F6;";


            lightbox.appendChild(
                fullscreenButton
            );

        }



        /* -------------------------------------------------
           UPDATE LIGHTBOX IMAGE
        ------------------------------------------------- */

        function showLightboxImage(
            index
        ) {

            currentImageIndex =
                (
                    index +
                    galleryImages.length
                ) %
                galleryImages.length;


            const image =
                galleryImages[
                    currentImageIndex
                ];


            if (!image?.src) {
                return;
            }


            lightboxImage.src =
                image.src;


            if (image.alt) {

                lightboxImage.alt =
                    image.alt;

            }


            productThumbnails.forEach(
                (
                    thumbnail,
                    thumbnailIndex
                ) => {

                    thumbnail.classList.toggle(
                        "active",
                        thumbnailIndex ===
                            currentImageIndex
                    );

                }
            );

        }



        /* -------------------------------------------------
           OPEN LIGHTBOX
        ------------------------------------------------- */

        function openLightbox(
            index = currentImageIndex
        ) {

            showLightboxImage(index);


            lightbox.setAttribute(
                "aria-hidden",
                "false"
            );


            lightbox.classList.add(
                "show"
            );


            document.body.classList.add(
                "lightbox-open"
            );

        }



        /* -------------------------------------------------
           CLOSE LIGHTBOX
        ------------------------------------------------- */

        function closeLightbox() {

            lightbox.setAttribute(
                "aria-hidden",
                "true"
            );


            lightbox.classList.remove(
                "show"
            );


            document.body.classList.remove(
                "lightbox-open"
            );

        }



        /* -------------------------------------------------
           MAIN IMAGE CLICK
        ------------------------------------------------- */

        if (mainProductImage) {

            mainProductImage.addEventListener(
                "click",
                function () {

                    const index =
                        parseInt(
                            this.dataset.index,
                            10
                        ) || 0;


                    openLightbox(index);

                }
            );

        }



        /* -------------------------------------------------
           LIGHTBOX PREVIOUS
        ------------------------------------------------- */

        if (lightboxPreviousButton) {

            lightboxPreviousButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    showLightboxImage(
                        currentImageIndex - 1
                    );

                }
            );

        }



        /* -------------------------------------------------
           LIGHTBOX NEXT
        ------------------------------------------------- */

        if (lightboxNextButton) {

            lightboxNextButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    showLightboxImage(
                        currentImageIndex + 1
                    );

                }
            );

        }



        /* -------------------------------------------------
           CLOSE LIGHTBOX
        ------------------------------------------------- */

        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === lightbox ||
                    event.target.classList.contains(
                        "lightbox-close"
                    )
                ) {

                    closeLightbox();

                }

            }
        );



        /* -------------------------------------------------
           NATIVE FULLSCREEN
        ------------------------------------------------- */

        if (fullscreenButton) {

            fullscreenButton.addEventListener(
                "click",
                async function (event) {

                    event.stopPropagation();


                    try {

                        if (
                            !document.fullscreenElement
                        ) {

                            if (
                                lightboxDialog.requestFullscreen
                            ) {

                                await lightboxDialog.requestFullscreen();

                            }

                        } else if (
                            document.exitFullscreen
                        ) {

                            await document.exitFullscreen();

                        }

                    } catch (error) {

                        /* Fullscreen unavailable */

                    }

                }
            );

        }



        /* -------------------------------------------------
           KEYBOARD CONTROLS
        ------------------------------------------------- */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    lightbox.getAttribute(
                        "aria-hidden"
                    ) === "true"
                ) {

                    return;

                }


                if (
                    event.key === "Escape"
                ) {

                    closeLightbox();

                    return;

                }


                if (
                    event.key === "ArrowLeft"
                ) {

                    showLightboxImage(
                        currentImageIndex - 1
                    );

                    return;

                }


                if (
                    event.key === "ArrowRight"
                ) {

                    showLightboxImage(
                        currentImageIndex + 1
                    );

                }

            }
        );



        /* -------------------------------------------------
           MAIN IMAGE SWIPE
        ------------------------------------------------- */

        let touchStartX = 0;
        let touchStartY = 0;


        if (mainProductImage) {

            mainProductImage.addEventListener(
                "touchstart",
                function (event) {

                    const touch =
                        event.changedTouches[0];


                    touchStartX =
                        touch.clientX;


                    touchStartY =
                        touch.clientY;

                },
                {
                    passive: true
                }
            );


            mainProductImage.addEventListener(
                "touchend",
                function (event) {

                    const touch =
                        event.changedTouches[0];


                    const differenceX =
                        touch.clientX -
                        touchStartX;


                    const differenceY =
                        touch.clientY -
                        touchStartY;


                    if (
                        Math.abs(
                            differenceX
                        ) < 50 ||
                        Math.abs(
                            differenceX
                        ) <
                        Math.abs(
                            differenceY
                        )
                    ) {

                        return;

                    }


                    if (
                        differenceX < 0
                    ) {

                        showProductImage(
                            currentImageIndex + 1
                        );

                    } else {

                        showProductImage(
                            currentImageIndex - 1
                        );

                    }

                },
                {
                    passive: true
                }
            );

        }



        /* -------------------------------------------------
           LIGHTBOX SWIPE
        ------------------------------------------------- */

        let lightboxTouchStartX = 0;
        let lightboxTouchStartY = 0;


        lightboxImage.addEventListener(
            "touchstart",
            function (event) {

                const touch =
                    event.changedTouches[0];


                lightboxTouchStartX =
                    touch.clientX;


                lightboxTouchStartY =
                    touch.clientY;

            },
            {
                passive: true
            }
        );


        lightboxImage.addEventListener(
            "touchend",
            function (event) {

                const touch =
                    event.changedTouches[0];


                const differenceX =
                    touch.clientX -
                    lightboxTouchStartX;


                const differenceY =
                    touch.clientY -
                    lightboxTouchStartY;


                if (
                    Math.abs(
                        differenceX
                    ) < 50 ||
                    Math.abs(
                        differenceX
                    ) <
                    Math.abs(
                        differenceY
                    )
                ) {

                    return;

                }


                if (
                    differenceX < 0
                ) {

                    showLightboxImage(
                        currentImageIndex + 1
                    );

                } else {

                    showLightboxImage(
                        currentImageIndex - 1
                    );

                }

            },
            {
                passive: true
            }
        );

    }

});