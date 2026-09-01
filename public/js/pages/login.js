/* =========================================================
   LOGIN PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const loginForm =
        document.getElementById("loginForm");


    const emailInput =
        document.getElementById("email");


    const passwordInput =
        document.getElementById("password");


    const passwordToggle =
        document.getElementById("passwordToggle");


    const loginSubmit =
        document.getElementById("loginSubmit");


    const loginButtonText =
        document.getElementById("loginButtonText");



    /* =====================================================
       PASSWORD SHOW / HIDE
       ===================================================== */

    if (
        passwordToggle &&
        passwordInput
    ) {

        passwordToggle.addEventListener(
            "click",
            function () {

                const isPassword =
                    passwordInput.type === "password";


                passwordInput.type =
                    isPassword
                        ? "text"
                        : "password";


                passwordToggle.textContent =
                    isPassword
                        ? "🙈"
                        : "👁";


                passwordToggle.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Hide password"
                        : "Show password"
                );

            }
        );

    }



    /* =====================================================
       EMAIL VALIDATION
       ===================================================== */

    function validateEmail() {

        if (!emailInput) {
            return false;
        }


        const email =
            emailInput.value.trim();


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            emailInput.classList.add(
                "is-invalid"
            );

            emailInput.classList.remove(
                "is-valid"
            );

            return false;
        }


        emailInput.classList.remove(
            "is-invalid"
        );

        emailInput.classList.add(
            "is-valid"
        );


        return true;
    }



    /* =====================================================
       PASSWORD VALIDATION
       ===================================================== */

    function validatePassword() {

        if (!passwordInput) {
            return false;
        }


        const password =
            passwordInput.value;


        if (!password) {

            passwordInput.classList.add(
                "is-invalid"
            );

            passwordInput.classList.remove(
                "is-valid"
            );

            return false;
        }


        passwordInput.classList.remove(
            "is-invalid"
        );

        passwordInput.classList.add(
            "is-valid"
        );


        return true;
    }



    /* =====================================================
       LIVE VALIDATION
       ===================================================== */

    if (emailInput) {

        emailInput.addEventListener(
            "blur",
            validateEmail
        );

    }


    if (passwordInput) {

        passwordInput.addEventListener(
            "blur",
            validatePassword
        );

    }



    /* =====================================================
       FORM SUBMIT
       ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                const emailValid =
                    validateEmail();


                const passwordValid =
                    validatePassword();


                if (
                    !emailValid ||
                    !passwordValid
                ) {

                    event.preventDefault();

                    return;
                }


                /* =========================================
                   DISABLE BUTTON
                   ========================================= */

                if (loginSubmit) {

                    loginSubmit.disabled =
                        true;

                }


                if (loginButtonText) {

                    loginButtonText.textContent =
                        "Logging in...";

                }

            }
        );

    }

});