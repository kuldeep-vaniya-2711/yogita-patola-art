/* =========================================================
   EDIT PRODUCT PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const form =
        document.getElementById("editProductForm");

    const imageInput =
        document.getElementById("productImages");

    const previewContainer =
        document.getElementById("imagePreview");

    const imageCount =
        document.getElementById("imageCount");


    /* =====================================================
       SAFETY CHECK
       ===================================================== */

    if (!form) {
        return;
    }


    /* =====================================================
       IMAGE PREVIEW
       ===================================================== */

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            function () {

                const files =
                    Array.from(this.files);

                /* -----------------------------------------
                   CLEAR OLD PREVIEW
                   ----------------------------------------- */

                if (previewContainer) {
                    previewContainer.innerHTML = "";
                }


                /* -----------------------------------------
                   RESET COUNT
                   ----------------------------------------- */

                if (imageCount) {
                    imageCount.textContent =
                        `${files.length} image${files.length !== 1 ? "s" : ""} selected`;
                }


                /* -----------------------------------------
                   NO FILE
                   ----------------------------------------- */

                if (files.length === 0) {
                    return;
                }


                /* -----------------------------------------
                   MAX 5 IMAGES
                   ----------------------------------------- */

                if (files.length > 5) {

                    alert(
                        "You can upload maximum 5 images."
                    );

                    this.value = "";

                    if (imageCount) {
                        imageCount.textContent =
                            "0 images selected";
                    }

                    return;
                }


                /* -----------------------------------------
                   ALLOWED TYPES
                   ----------------------------------------- */

                const allowedTypes = [
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp"
                ];


                /* -----------------------------------------
                   VALIDATE FILES
                   ----------------------------------------- */

                for (const file of files) {

                    if (
                        !allowedTypes.includes(
                            file.type
                        )
                    ) {

                        alert(
                            `${file.name} is not a supported image format.`
                        );

                        this.value = "";

                        if (previewContainer) {
                            previewContainer.innerHTML = "";
                        }

                        if (imageCount) {
                            imageCount.textContent =
                                "0 images selected";
                        }

                        return;
                    }


                    /* -------------------------------------
                       MAX 5MB
                       ------------------------------------- */

                    const maxSize =
                        5 * 1024 * 1024;

                    if (file.size > maxSize) {

                        alert(
                            `${file.name} is larger than 5MB.`
                        );

                        this.value = "";

                        if (previewContainer) {
                            previewContainer.innerHTML = "";
                        }

                        if (imageCount) {
                            imageCount.textContent =
                                "0 images selected";
                        }

                        return;
                    }
                }


                /* =================================================
                   CREATE PREVIEWS
                   ================================================= */

                if (!previewContainer) {
                    return;
                }


                files.forEach(
                    function (file) {

                        const reader =
                            new FileReader();


                        reader.onload =
                            function (event) {

                                const wrapper =
                                    document.createElement(
                                        "div"
                                    );

                                wrapper.className =
                                    "edit-image-preview";


                                const image =
                                    document.createElement(
                                        "img"
                                    );

                                image.src =
                                    event.target.result;

                                image.alt =
                                    file.name;


                                wrapper.appendChild(
                                    image
                                );

                                previewContainer.appendChild(
                                    wrapper
                                );
                            };


                        reader.readAsDataURL(file);
                    }
                );
            }
        );
    }


    /* =====================================================
       FORM SUBMIT PROTECTION
       ===================================================== */

    form.addEventListener(
        "submit",
        function (event) {

            const name =
                document.getElementById(
                    "name"
                );

            const price =
                document.getElementById(
                    "price"
                );


            /* -----------------------------------------
               PRODUCT NAME
               ----------------------------------------- */

            if (
                name &&
                name.value.trim() === ""
            ) {

                event.preventDefault();

                alert(
                    "Please enter product name."
                );

                name.focus();

                return;
            }


            /* -----------------------------------------
               PRICE
               ----------------------------------------- */

            if (
                price &&
                (
                    price.value.trim() === "" ||
                    Number(price.value) < 0
                )
            ) {

                event.preventDefault();

                alert(
                    "Please enter a valid price."
                );

                price.focus();

                return;
            }


            /* -----------------------------------------
               SUBMIT BUTTON
               ----------------------------------------- */

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Updating Product...";
            }
        }
    );

});