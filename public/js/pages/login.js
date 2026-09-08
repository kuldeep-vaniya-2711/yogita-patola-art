/* =========================================================
   LOGIN PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const passwordToggle = document.getElementById("passwordToggle");
    const loginSubmit = document.getElementById("loginSubmit");
    const loginButtonText = document.getElementById("loginButtonText");

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener("click", function () {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            passwordToggle.textContent = isPassword ? "🙈" : "👁";
            passwordToggle.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        });
    }

    function setFieldValidity(input, isValid) {
        if (!input) return isValid;
        input.classList.toggle("is-valid", isValid);
        input.classList.toggle("is-invalid", !isValid);
        return isValid;
    }

    function validateEmail() {
        if (!emailInput) return false;
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
        return setFieldValidity(emailInput, valid);
    }

    function validatePassword() {
        if (!passwordInput) return false;
        return setFieldValidity(passwordInput, Boolean(passwordInput.value));
    }

    if (emailInput) emailInput.addEventListener("blur", validateEmail);
    if (passwordInput) passwordInput.addEventListener("blur", validatePassword);

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            if (!validateEmail() | !validatePassword()) {
                e.preventDefault();
                return;
            }
            if (loginSubmit) loginSubmit.disabled = true;
            if (loginButtonText) loginButtonText.textContent = "Logging in...";
        });
    }
});