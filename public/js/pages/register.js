/* =========================================================
   REGISTER PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =====================================================
           ELEMENTS
           ===================================================== */

        const registerForm =
            document.getElementById("registerForm");


        const nameInput =
            document.getElementById("name");


        const emailInput =
            document.getElementById("email");


        const phoneInput =
            document.getElementById("phone");


        const passwordInput =
            document.getElementById("password");


        const confirmPasswordInput =
            document.getElementById("confirmPassword");


        const termsInput =
            document.getElementById("terms");


        const passwordToggle =
            document.getElementById("passwordToggle");


        const confirmPasswordToggle =
            document.getElementById(
                "confirmPasswordToggle"
            );


        const registerSubmit =
            document.getElementById(
                "registerSubmit"
            );


        const registerButtonText =
            document.getElementById(
                "registerButtonText"
            );



        /* =====================================================
           PASSWORD TOGGLE FUNCTION
           ===================================================== */

        function setupPasswordToggle(
            button,
            input
        ) {

            if (
                !button ||
                !input
            ) {

                return;

            }


            button.addEventListener(
                "click",
                function () {

                    const isPassword =
                        input.type === "password";


                    input.type =
                        isPassword
                            ? "text"
                            : "password";


                    button.textContent =
                        isPassword
                            ? "🙈"
                            : "👁";


                    button.setAttribute(
                        "aria-label",
                        isPassword
                            ? "Hide password"
                            : "Show password"
                    );

                }
            );

        }


        setupPasswordToggle(
            passwordToggle,
            passwordInput
        );


        setupPasswordToggle(
            confirmPasswordToggle,
            confirmPasswordInput
        );



        /* =====================================================
           NAME VALIDATION
           ===================================================== */

        function validateName() {

            if (!nameInput) {

                return false;

            }


            const name =
                nameInput.value.trim();


            if (
                name.length < 2 ||
                name.length > 100
            ) {

                nameInput.classList.add(
                    "is-invalid"
                );

                nameInput.classList.remove(
                    "is-valid"
                );

                return false;

            }


            nameInput.classList.remove(
                "is-invalid"
            );

            nameInput.classList.add(
                "is-valid"
            );


            return true;

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


            if (
                !emailPattern.test(email)
            ) {

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
           PHONE VALIDATION
           ===================================================== */

        function validatePhone() {

            if (!phoneInput) {

                return true;

            }


            const phone =
                phoneInput.value.trim();


            /*
             * Phone optional hai.
             * Empty hone par valid.
             */

            if (!phone) {

                phoneInput.classList.remove(
                    "is-invalid",
                    "is-valid"
                );

                return true;

            }


            /*
             * Basic phone validation.
             */

            const phonePattern =
                /^[0-9+\-\s()]{7,15}$/;


            if (
                !phonePattern.test(phone)
            ) {

                phoneInput.classList.add(
                    "is-invalid"
                );

                phoneInput.classList.remove(
                    "is-valid"
                );

                return false;

            }


            phoneInput.classList.remove(
                "is-invalid"
            );

            phoneInput.classList.add(
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


            if (
                password.length < 6
            ) {

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
           CONFIRM PASSWORD
           ===================================================== */

        function validateConfirmPassword() {

            if (
                !confirmPasswordInput ||
                !passwordInput
            ) {

                return false;

            }


            const password =
                passwordInput.value;


            const confirmPassword =
                confirmPasswordInput.value;


            if (
                !confirmPassword ||
                password !== confirmPassword
            ) {

                confirmPasswordInput.classList.add(
                    "is-invalid"
                );

                confirmPasswordInput.classList.remove(
                    "is-valid"
                );

                return false;

            }


            confirmPasswordInput.classList.remove(
                "is-invalid"
            );

            confirmPasswordInput.classList.add(
                "is-valid"
            );


            return true;

        }



        /* =====================================================
           TERMS VALIDATION
           ===================================================== */

        function validateTerms() {

            if (!termsInput) {

                return true;

            }


            if (!termsInput.checked) {

                termsInput.classList.add(
                    "is-invalid"
                );

                return false;

            }


            termsInput.classList.remove(
                "is-invalid"
            );


            return true;

        }



        /* =====================================================
           LIVE VALIDATION
           ===================================================== */

        if (nameInput) {

            nameInput.addEventListener(
                "blur",
                validateName
            );

        }


        if (emailInput) {

            emailInput.addEventListener(
                "blur",
                validateEmail
            );

        }


        if (phoneInput) {

            phoneInput.addEventListener(
                "blur",
                validatePhone
            );

        }


        if (passwordInput) {

            passwordInput.addEventListener(
                "blur",
                function () {

                    validatePassword();

                    if (
                        confirmPasswordInput &&
                        confirmPasswordInput.value
                    ) {

                        validateConfirmPassword();

                    }

                }
            );

        }


        if (confirmPasswordInput) {

            confirmPasswordInput.addEventListener(
                "blur",
                validateConfirmPassword
            );

        }


        if (termsInput) {

            termsInput.addEventListener(
                "change",
                validateTerms
            );

        }



        /* =====================================================
           FORM SUBMIT
           ===================================================== */

        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                function (event) {


                    const nameValid =
                        validateName();


                    const emailValid =
                        validateEmail();


                    const phoneValid =
                        validatePhone();


                    const passwordValid =
                        validatePassword();


                    const confirmPasswordValid =
                        validateConfirmPassword();


                    const termsValid =
                        validateTerms();


                    const formValid =
                        nameValid &&
                        emailValid &&
                        phoneValid &&
                        passwordValid &&
                        confirmPasswordValid &&
                        termsValid;


                    if (!formValid) {

                        event.preventDefault();

                        return;

                    }


                    /* =========================================
                       DISABLE SUBMIT BUTTON
                       ========================================= */

                    if (registerSubmit) {

                        registerSubmit.disabled =
                            true;

                    }


                    if (registerButtonText) {

                        registerButtonText.textContent =
                            "Creating Account...";

                    }

                }
            );

        }

    }
);