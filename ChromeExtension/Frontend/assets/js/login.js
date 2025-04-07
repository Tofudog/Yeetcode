// Handle login functionality
const storeUser = (leetcodeId) => {
    chrome.storage.local.set({ 
        user: {
            leetcodeId: leetcodeId,
            loggedIn: true,
            timestamp: Date.now()
        }
    });
};

document.addEventListener("DOMContentLoaded", function () {
    // Check if user is already logged in
    chrome.storage.local.get(['user'], (result) => {
        if (result.user && result.user.loggedIn) {
            // User is already logged in, redirect to main screen
            window.location.href = "main-screen.html";
        }
    });

    let login_button = document.getElementById("yeetcode-login-button");
    if (login_button) {
        login_button.addEventListener("click", function () {
            const leetcodeId = document.querySelector('.login-input[placeholder="Enter Leetcode ID here"]').value.trim();
            
            if (leetcodeId) {
                // Store the user
                storeUser(leetcodeId);
                
                // Redirect to main screen
                window.location.href = "main-screen.html";
            } else {
                // Show error message
                alert("Please enter your Leetcode ID");
            }
        });
    }

    let signup_button = document.getElementById("yeetcode-signup-button");
    if (signup_button) {
        signup_button.addEventListener("click", function () {
            window.location.href = "signup-page-screen.html"; // Navigate back to main screen
        });
    }
});
