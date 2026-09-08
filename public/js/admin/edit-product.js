/* =========================================================
   EDIT PRODUCT PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("editProductForm");
    const imageInput = document.getElementById("productImages");
    const previewContainer = document.getElementById("imagePreview");
    const imageCount = document.getElementById("imageCount");

    if (!form) return;

    if (imageInput) {
        imageInput.addEventListener("change", function () {
            const files = Array.from(this.files);
            if (previewContainer) previewContainer.innerHTML = "";
            if (imageCount) imageCount.textContent = `${files.length} image${files.length !== 1 ? "s" : ""} selected`;
            if (files.length === 0) return;

            if (files.length > 5) {
                alert("You can upload maximum 5 images.");
                this.value = "";
                if (imageCount) imageCount.textContent = "0 images selected";
                return;
            }

            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            for (const file of files) {
                if (!allowedTypes.includes(file.type)) {
                    alert(`${file.name} is not a supported image format.`);
                    this.value = "";
                    if (previewContainer) previewContainer.innerHTML = "";
                    if (imageCount) imageCount.textContent = "0 images selected";
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    alert(`${file.name} is larger than 5MB.`);
                    this.value = "";
                    if (previewContainer) previewContainer.innerHTML = "";
                    if (imageCount) imageCount.textContent = "0 images selected";
                    return;
                }
            }

            if (!previewContainer) return;
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const wrapper = document.createElement("div");
                    wrapper.className = "edit-image-preview";
                    const image = document.createElement("img");
                    image.src = e.target.result;
                    image.alt = file.name;
                    wrapper.appendChild(image);
                    previewContainer.appendChild(wrapper);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    form.addEventListener("submit", function (e) {
        const name = document.getElementById("name");
        const price = document.getElementById("price");

        if (name && name.value.trim() === "") {
            e.preventDefault();
            alert("Please enter product name.");
            name.focus();
            return;
        }

        if (price && (price.value.trim() === "" || Number(price.value) < 0)) {
            e.preventDefault();
            alert("Please enter a valid price.");
            price.focus();
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Updating Product...";
        }
    });
});