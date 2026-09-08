/* =========================================================
   REGISTER PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const termsInput = document.getElementById("terms");
    const passwordToggle = document.getElementById("passwordToggle");
    const confirmPasswordToggle = document.getElementById("confirmPasswordToggle");
    const registerSubmit = document.getElementById("registerSubmit");
    const registerButtonText = document.getElementById("registerButtonText");

    function setupPasswordToggle(button, input) {
        if (!button || !input) return;
        button.addEventListener("click", function () {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            button.textContent = isPassword ? "🙈" : "👁";
            button.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        });
    }

    setupPasswordToggle(passwordToggle, passwordInput);
    setupPasswordToggle(confirmPasswordToggle, confirmPasswordInput);

    function setValidity(el, isValid) {
        if (!el) return isValid;
        el.classList.toggle("is-valid", isValid);
        el.classList.toggle("is-invalid", !isValid);
        return isValid;
    }

    function validateName() {
        if (!nameInput) return false;
        const name = nameInput.value.trim();
        return setValidity(nameInput, name.length >= 2 && name.length <= 100);
    }

    function validateEmail() {
        if (!emailInput) return false;
        const email = emailInput.value.trim();
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return setValidity(emailInput, pattern.test(email));
    }

    function validatePhone() {
        if (!phoneInput) return true;
        const phone = phoneInput.value.trim();
        if (!phone) {
            phoneInput.classList.remove("is-invalid", "is-valid");
            return true;
        }
        return setValidity(phoneInput, /^[0-9+\-\s()]{7,15}$/.test(phone));
    }

    function validatePassword() {
        if (!passwordInput) return false;
        return setValidity(passwordInput, passwordInput.value.length >= 6);
    }

    function validateConfirmPassword() {
        if (!confirmPasswordInput || !passwordInput) return false;
        const match = Boolean(confirmPasswordInput.value) && passwordInput.value === confirmPasswordInput.value;
        return setValidity(confirmPasswordInput, match);
    }

    function validateTerms() {
        if (!termsInput) return true;
        if (!termsInput.checked) {
            termsInput.classList.add("is-invalid");
            return false;
        }
        termsInput.classList.remove("is-invalid");
        return true;
    }

    if (nameInput) nameInput.addEventListener("blur", validateName);
    if (emailInput) emailInput.addEventListener("blur", validateEmail);
    if (phoneInput) phoneInput.addEventListener("blur", validatePhone);

    if (passwordInput) {
        passwordInput.addEventListener("blur", () => {
            validatePassword();
            if (confirmPasswordInput && confirmPasswordInput.value) validateConfirmPassword();
        });
    }

    if (confirmPasswordInput) confirmPasswordInput.addEventListener("blur", validateConfirmPassword);
    if (termsInput) termsInput.addEventListener("change", validateTerms);

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            const valid = validateName() &
                          validateEmail() &
                          validatePhone() &
                          validatePassword() &
                          validateConfirmPassword() &
                          validateTerms();

            if (!valid) {
                e.preventDefault();
                return;
            }

            if (registerSubmit) registerSubmit.disabled = true;
            if (registerButtonText) registerButtonText.textContent = "Creating Account...";
        });
    }
});