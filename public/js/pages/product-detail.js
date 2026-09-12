/* =========================================================
   YOGITA PATOLA ART
   PRODUCT DETAIL PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const mainImage =
        document.getElementById("mainProductImage");

    const thumbnails =
        Array.from(
            document.querySelectorAll(".product-thumbnail")
        );

    const galleryPrev =
        document.getElementById("productGalleryPrev");

    const galleryNext =
        document.getElementById("productGalleryNext");

    const openLightboxButton =
        document.getElementById("openProductLightbox");

    const lightbox =
        document.getElementById("productLightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");

    const lightboxClose =
        document.getElementById("lightboxClose");

    const lightboxPrev =
        document.getElementById("lightboxPrev");

    const lightboxNext =
        document.getElementById("lightboxNext");

    const lightboxFullscreen =
        document.getElementById("lightboxFullscreen");


    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (!mainImage) {
        return;
    }


    /* =====================================================
       IMAGE LIST
    ===================================================== */

    const images = thumbnails.length
        ? thumbnails.map(function (thumbnail) {

            const image =
                thumbnail.getAttribute("data-image");

            return image || "";

        }).filter(Boolean)

        : [
            mainImage.getAttribute("src") || ""
        ].filter(Boolean);


    if (!images.length) {
        return;
    }


    /* =====================================================
       CURRENT IMAGE INDEX
    ===================================================== */

    let currentIndex = 0;


    /* =====================================================
       FIND INITIAL ACTIVE IMAGE
    ===================================================== */

    if (thumbnails.length) {

        const activeThumbnail =
            thumbnails.findIndex(function (thumbnail) {

                return thumbnail.classList.contains("active");

            });

        if (activeThumbnail >= 0) {
            currentIndex = activeThumbnail;
        }
    }


    /* =====================================================
       UPDATE MAIN IMAGE
    ===================================================== */

    function updateMainImage(index) {

        if (!images.length) {
            return;
        }


        /* ---------------------------------------------
           LOOP INDEX
        --------------------------------------------- */

        if (index < 0) {

            index =
                images.length - 1;

        }

        if (index >= images.length) {

            index = 0;

        }


        currentIndex = index;


        /* ---------------------------------------------
           IMAGE
        --------------------------------------------- */

        const newImage =
            images[currentIndex];

        mainImage.src =
            newImage;


        /* ---------------------------------------------
           ACTIVE THUMBNAIL
        --------------------------------------------- */

        thumbnails.forEach(function (thumbnail, thumbnailIndex) {

            const isActive =
                thumbnailIndex === currentIndex;

            thumbnail.classList.toggle(
                "active",
                isActive
            );

            thumbnail.setAttribute(
                "aria-current",
                isActive
                    ? "true"
                    : "false"
            );

        });


        /* ---------------------------------------------
           LIGHTBOX IMAGE
        --------------------------------------------- */

        if (lightboxImage) {

            lightboxImage.src =
                newImage;

        }


        /* ---------------------------------------------
           SCROLL ACTIVE THUMBNAIL INTO VIEW
        --------------------------------------------- */

        if (thumbnails[currentIndex]) {

            thumbnails[currentIndex].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });

        }

    }


    /* =====================================================
       PREVIOUS IMAGE
    ===================================================== */

    function showPreviousImage() {

        updateMainImage(
            currentIndex - 1
        );

    }


    /* =====================================================
       NEXT IMAGE
    ===================================================== */

    function showNextImage() {

        updateMainImage(
            currentIndex + 1
        );

    }


    /* =====================================================
       THUMBNAIL CLICK
    ===================================================== */

    thumbnails.forEach(function (thumbnail, index) {

        thumbnail.addEventListener(
            "click",
            function () {

                updateMainImage(index);

            }
        );

    });


    /* =====================================================
       GALLERY PREVIOUS
    ===================================================== */

    if (galleryPrev) {

        galleryPrev.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showPreviousImage();

            }
        );

    }


    /* =====================================================
       GALLERY NEXT
    ===================================================== */

    if (galleryNext) {

        galleryNext.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showNextImage();

            }
        );

    }


    /* =====================================================
       LIGHTBOX OPEN
    ===================================================== */

    function openLightbox() {

        if (!lightbox) {
            return;
        }


        /* ---------------------------------------------
           UPDATE IMAGE
        --------------------------------------------- */

        if (lightboxImage) {

            lightboxImage.src =
                images[currentIndex];

        }


        /* ---------------------------------------------
           SHOW LIGHTBOX
        --------------------------------------------- */

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );


        lightbox.classList.add(
            "is-open"
        );


        /* ---------------------------------------------
           LOCK PAGE SCROLL
        --------------------------------------------- */

        document.body.classList.add(
            "lightbox-open"
        );


        document.body.style.overflow =
            "hidden";


        /* ---------------------------------------------
           FOCUS CLOSE BUTTON
        --------------------------------------------- */

        if (lightboxClose) {

            setTimeout(function () {

                lightboxClose.focus();

            }, 50);

        }

    }


    /* =====================================================
       LIGHTBOX CLOSE
    ===================================================== */

    function closeLightbox() {

        if (!lightbox) {
            return;
        }


        /* ---------------------------------------------
           EXIT FULLSCREEN IF ACTIVE
        --------------------------------------------- */

        if (
            document.fullscreenElement
        ) {

            if (
                document.exitFullscreen
            ) {

                document
                    .exitFullscreen()
                    .catch(function () {});

            }

        }


        /* ---------------------------------------------
           HIDE LIGHTBOX
        --------------------------------------------- */

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );


        lightbox.classList.remove(
            "is-open"
        );


        /* ---------------------------------------------
           RESTORE PAGE SCROLL
        --------------------------------------------- */

        document.body.classList.remove(
            "lightbox-open"
        );


        document.body.style.overflow =
            "";

    }


    /* =====================================================
       OPEN BUTTON
    ===================================================== */

    if (openLightboxButton) {

        openLightboxButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openLightbox();

            }
        );

    }


    /* =====================================================
       MAIN IMAGE CLICK
       ALSO OPENS LIGHTBOX
    ===================================================== */

    mainImage.addEventListener(
        "click",
        function () {

            openLightbox();

        }
    );


    /* =====================================================
       LIGHTBOX CLOSE BUTTON
    ===================================================== */

    if (lightboxClose) {

        lightboxClose.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                closeLightbox();

            }
        );

    }


    /* =====================================================
       CLICK BACKDROP TO CLOSE
    ===================================================== */

    if (lightbox) {

        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === lightbox
                ) {

                    closeLightbox();

                }

            }
        );

    }


    /* =====================================================
       LIGHTBOX PREVIOUS
    ===================================================== */

    if (lightboxPrev) {

        lightboxPrev.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showPreviousImage();

            }
        );

    }


    /* =====================================================
       LIGHTBOX NEXT
    ===================================================== */

    if (lightboxNext) {

        lightboxNext.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showNextImage();

            }
        );

    }


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {


            /* -----------------------------------------
               ESC
            ----------------------------------------- */

            if (
                event.key === "Escape" &&
                lightbox &&
                lightbox.getAttribute("aria-hidden") === "false"
            ) {

                event.preventDefault();

                closeLightbox();

                return;

            }


            /* -----------------------------------------
               LIGHTBOX CONTROLS
            ----------------------------------------- */

            if (
                !lightbox ||
                lightbox.getAttribute("aria-hidden") !== "false"
            ) {

                return;

            }


            if (
                event.key === "ArrowLeft"
            ) {

                event.preventDefault();

                showPreviousImage();

            }


            if (
                event.key === "ArrowRight"
            ) {

                event.preventDefault();

                showNextImage();

            }

        }
    );


    /* =====================================================
       FULLSCREEN
    ===================================================== */

    if (lightboxFullscreen) {

        lightboxFullscreen.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const dialog =
                    lightbox
                        ? lightbox.querySelector(
                            ".lightbox-dialog"
                        )
                        : null;


                if (!dialog) {
                    return;
                }


                /* -----------------------------------------
                   EXIT FULLSCREEN
                ----------------------------------------- */

                if (
                    document.fullscreenElement
                ) {

                    if (
                        document.exitFullscreen
                    ) {

                        document
                            .exitFullscreen()
                            .catch(function () {});

                    }

                    return;

                }


                /* -----------------------------------------
                   ENTER FULLSCREEN
                ----------------------------------------- */

                if (
                    dialog.requestFullscreen
                ) {

                    dialog
                        .requestFullscreen()
                        .catch(function () {});

                }

            }
        );

    }


    /* =====================================================
       UPDATE FULLSCREEN ICON
    ===================================================== */

    document.addEventListener(
        "fullscreenchange",
        function () {

            if (!lightboxFullscreen) {
                return;
            }


            const icon =
                lightboxFullscreen.querySelector("i");


            if (!icon) {
                return;
            }


            if (
                document.fullscreenElement
            ) {

                icon.className =
                    "bi bi-fullscreen-exit";

                lightboxFullscreen.setAttribute(
                    "aria-label",
                    "Exit fullscreen"
                );

            } else {

                icon.className =
                    "bi bi-fullscreen";

                lightboxFullscreen.setAttribute(
                    "aria-label",
                    "Enter fullscreen"
                );

            }

        }
    );


    /* =====================================================
       TOUCH SWIPE SUPPORT
    ===================================================== */

    let touchStartX = 0;
    let touchEndX = 0;


    if (lightboxImage) {

        lightboxImage.addEventListener(
            "touchstart",
            function (event) {

                if (
                    !event.touches ||
                    !event.touches.length
                ) {
                    return;
                }

                touchStartX =
                    event.touches[0].clientX;

            },
            {
                passive: true
            }
        );


        lightboxImage.addEventListener(
            "touchend",
            function (event) {

                if (
                    !event.changedTouches ||
                    !event.changedTouches.length
                ) {
                    return;
                }


                touchEndX =
                    event.changedTouches[0].clientX;


                const swipeDistance =
                    touchEndX - touchStartX;


                const minimumSwipe =
                    50;


                if (
                    Math.abs(swipeDistance) <
                    minimumSwipe
                ) {

                    return;

                }


                if (
                    swipeDistance > 0
                ) {

                    showPreviousImage();

                } else {

                    showNextImage();

                }

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       INITIAL IMAGE
    ===================================================== */

    updateMainImage(
        currentIndex
    );


    /* =====================================================
       INITIAL LIGHTBOX STATE
    ===================================================== */

    if (lightbox) {

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        lightbox.classList.remove(
            "is-open"
        );

    }


    /* =====================================================
       LOG
    ===================================================== */

    console.log(
        "Product gallery initialized:",
        images.length,
        "image(s)"
    );

});