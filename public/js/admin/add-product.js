document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addProductForm");
    const images = document.getElementById("productImages");
    const preview = document.getElementById("imagePreview");
    const submitBtn = document.getElementById("saveProductBtn");
    const featuredProduct = document.getElementById("featuredProduct");

    if (!form) return;

    if (featuredProduct) {
        featuredProduct.addEventListener("change", () => {
            console.log("Featured Product:", featuredProduct.checked);
        });
    }

    if (images && preview) {
        images.addEventListener("change", () => {
            preview.innerHTML = "";
            const files = Array.from(images.files || []);
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

            if (files.length > 5) {
                alert("You can upload maximum 5 images.");
                images.value = "";
                return;
            }

            for (const file of files) {
                if (!allowedTypes.includes(file.type)) {
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
            }

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const item = document.createElement("div");
                    item.className = "product-preview-item";
                    item.innerHTML = `<img src="${e.target.result}" alt="${file.name}"><span>${file.name}</span>`;
                    preview.appendChild(item);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    form.addEventListener("submit", (e) => {
        const name = document.getElementById("productName")?.value.trim();
        const category = document.getElementById("productCategory")?.value.trim();
        const price = document.getElementById("productPrice")?.value;

        if (!name || !category || !price) {
            e.preventDefault();
            alert("Please enter Product Name, Category and Price.");
            return;
        }

        if (Number(price) < 0) {
            e.preventDefault();
            alert("Product price cannot be negative.");
            return;
        }

        if (images && images.files.length > 5) {
            e.preventDefault();
            alert("You can upload maximum 5 images.");
            return;
        }

        if (featuredProduct) {
            console.log("Submitting Featured Product:", featuredProduct.checked);
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            const text = submitBtn.querySelector("span");
            if (text) text.textContent = "Adding Product...";
            const icon = submitBtn.querySelector("i");
            if (icon) icon.className = "bi bi-hourglass-split";
        }
    });
});