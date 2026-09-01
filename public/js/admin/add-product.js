document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("addProductForm");
    const images = document.getElementById("productImages");
    const preview = document.getElementById("imagePreview");
    const submitBtn = document.getElementById("saveProductBtn");

    if (!form) return;


    /* =========================
       IMAGE PREVIEW + VALIDATION
       ========================= */

    images?.addEventListener("change", () => {

        preview.innerHTML = "";

        const files = [...images.files];

        if (files.length > 5) {
            alert("You can upload maximum 5 images.");
            images.value = "";
            return;
        }

        files.forEach(file => {

            if (!["image/jpeg", "image/jpg", "image/png", "image/webp"]
                .includes(file.type)) {

                alert("Only JPG, JPEG, PNG and WEBP images are allowed.");
                images.value = "";
                preview.innerHTML = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert(`"${file.name}" is larger than 5MB.`);
                images.value = "";
                preview.innerHTML = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = event => {

                const item = document.createElement("div");
                item.className = "product-preview-item";

                item.innerHTML = `
                    <img
                        src="${event.target.result}"
                        alt="${file.name}"
                    >
                    <span>${file.name}</span>
                `;

                preview.appendChild(item);
            };

            reader.readAsDataURL(file);
        });
    });


    /* =========================
       FORM SUBMIT
       ========================= */

    form.addEventListener("submit", event => {

        const name =
            document.getElementById("productName")?.value.trim();

        const category =
            document.getElementById("productCategory")?.value.trim();

        const price =
            document.getElementById("productPrice")?.value;

        if (!name || !category || !price) {
            event.preventDefault();

            alert(
                "Please enter Product Name, Category and Price."
            );

            return;
        }

        if (Number(price) < 0) {
            event.preventDefault();

            alert("Product price cannot be negative.");

            return;
        }

        if (images?.files.length > 5) {
            event.preventDefault();

            alert("You can upload maximum 5 images.");

            return;
        }

        if (submitBtn) {

            submitBtn.disabled = true;

            const text =
                submitBtn.querySelector("span");

            if (text) {
                text.textContent = "Adding Product...";
            }

            const icon =
                submitBtn.querySelector("i");

            if (icon) {
                icon.className = "bi bi-hourglass-split";
            }
        }
    });

});