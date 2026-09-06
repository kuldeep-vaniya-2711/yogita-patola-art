document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ==================================================
        // ELEMENTS
        // ==================================================

        const form =
            document.getElementById(
                "addProductForm"
            );

        const images =
            document.getElementById(
                "productImages"
            );

        const preview =
            document.getElementById(
                "imagePreview"
            );

        const submitBtn =
            document.getElementById(
                "saveProductBtn"
            );

        const featuredProduct =
            document.getElementById(
                "featuredProduct"
            );


        // ==================================================
        // STOP IF FORM DOES NOT EXIST
        // ==================================================

        if (!form) {
            return;
        }



        // ==================================================
        // FEATURED PRODUCT
        // ==================================================
        //
        // IMPORTANT:
        //
        // Checkbox ka actual value backend ko
        // normal HTML form ke through milega.
        //
        // Checked:
        // featured = "true"
        //
        // Unchecked:
        // featured field submit nahi hoga.
        //
        // Yahan hum checkbox ko manually disable,
        // remove ya change nahi kar rahe.
        // ==================================================

        if (featuredProduct) {

            featuredProduct.addEventListener(
                "change",
                () => {

                    console.log(
                        "Featured Product:",
                        featuredProduct.checked
                    );

                }
            );

        }



        // ==================================================
        // IMAGE PREVIEW + VALIDATION
        // ==================================================

        if (images && preview) {

            images.addEventListener(
                "change",
                () => {

                    preview.innerHTML = "";


                    const files =
                        Array.from(
                            images.files || []
                        );


                    // ------------------------------------------
                    // MAX 5 IMAGES
                    // ------------------------------------------

                    if (files.length > 5) {

                        alert(
                            "You can upload maximum 5 images."
                        );

                        images.value = "";

                        return;

                    }


                    // ------------------------------------------
                    // VALIDATE EACH IMAGE
                    // ------------------------------------------

                    for (const file of files) {


                        // --------------------------------------
                        // FILE TYPE
                        // --------------------------------------

                        const allowedTypes = [
                            "image/jpeg",
                            "image/jpg",
                            "image/png",
                            "image/webp"
                        ];


                        if (
                            !allowedTypes.includes(
                                file.type
                            )
                        ) {

                            alert(
                                "Only JPG, JPEG, PNG and WEBP images are allowed."
                            );

                            images.value = "";

                            preview.innerHTML = "";

                            return;

                        }


                        // --------------------------------------
                        // FILE SIZE
                        // --------------------------------------

                        if (
                            file.size >
                            5 * 1024 * 1024
                        ) {

                            alert(
                                `"${file.name}" is larger than 5MB.`
                            );

                            images.value = "";

                            preview.innerHTML = "";

                            return;

                        }

                    }



                    // ------------------------------------------
                    // CREATE PREVIEWS
                    // ------------------------------------------

                    files.forEach(
                        file => {

                            const reader =
                                new FileReader();


                            reader.onload =
                                event => {

                                    const item =
                                        document.createElement(
                                            "div"
                                        );


                                    item.className =
                                        "product-preview-item";


                                    item.innerHTML = `
                                        <img
                                            src="${event.target.result}"
                                            alt="${file.name}"
                                        >

                                        <span>
                                            ${file.name}
                                        </span>
                                    `;


                                    preview.appendChild(
                                        item
                                    );

                                };


                            reader.readAsDataURL(
                                file
                            );

                        }
                    );

                }
            );

        }



        // ==================================================
        // FORM SUBMIT
        // ==================================================

        form.addEventListener(
            "submit",
            event => {


                // ------------------------------------------
                // PRODUCT NAME
                // ------------------------------------------

                const name =
                    document
                        .getElementById(
                            "productName"
                        )
                        ?.value
                        .trim();


                // ------------------------------------------
                // CATEGORY
                // ------------------------------------------

                const category =
                    document
                        .getElementById(
                            "productCategory"
                        )
                        ?.value
                        .trim();


                // ------------------------------------------
                // PRICE
                // ------------------------------------------

                const price =
                    document
                        .getElementById(
                            "productPrice"
                        )
                        ?.value;



                // ------------------------------------------
                // REQUIRED FIELDS
                // ------------------------------------------

                if (
                    !name ||
                    !category ||
                    !price
                ) {

                    event.preventDefault();

                    alert(
                        "Please enter Product Name, Category and Price."
                    );

                    return;

                }



                // ------------------------------------------
                // PRICE VALIDATION
                // ------------------------------------------

                if (
                    Number(price) < 0
                ) {

                    event.preventDefault();

                    alert(
                        "Product price cannot be negative."
                    );

                    return;

                }



                // ------------------------------------------
                // IMAGE LIMIT
                // ------------------------------------------

                if (
                    images &&
                    images.files.length > 5
                ) {

                    event.preventDefault();

                    alert(
                        "You can upload maximum 5 images."
                    );

                    return;

                }



                // ==================================================
                // FEATURED DEBUG
                // ==================================================

                if (featuredProduct) {

                    console.log(
                        "Submitting Featured Product:",
                        featuredProduct.checked
                    );

                }



                // ==================================================
                // DISABLE BUTTON
                // ==================================================

                if (submitBtn) {

                    submitBtn.disabled = true;


                    const text =
                        submitBtn.querySelector(
                            "span"
                        );


                    if (text) {

                        text.textContent =
                            "Adding Product...";

                    }


                    const icon =
                        submitBtn.querySelector(
                            "i"
                        );


                    if (icon) {

                        icon.className =
                            "bi bi-hourglass-split";

                    }

                }

            }
        );


    }
);