
document.addEventListener("DOMContentLoaded", function () {
    let login_button = document.getElementById("yeetcode-login-button");
    if (login_button) {
        login_button.addEventListener("click", function () {
            window.location.href = "main-screen.html"; // Navigate back to main screen
        });
    }

    let signup_button = document.getElementById("yeetcode-signup-button");
    if (signup_button) {
        signup_button.addEventListener("click", function () {
            window.location.href = "signup-page-screen.html"; // Navigate back to main screen
        });
    }
});
