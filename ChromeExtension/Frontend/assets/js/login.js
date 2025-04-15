document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("yeetcode-login-button");
    const signupButton = document.getElementById("yeetcode-signup-button");
    const yeetcodeUsernameInput = document.querySelector("input[placeholder='Enter Leetcode ID here']");
    const yeetcodePasswordInput = document.querySelector("input[placeholder='Enter password here']");

    // Handle login button click
    loginButton.addEventListener("click", async function() {
        const yeetcode_username = yeetcodeUsernameInput.value.trim();
        const yeetcode_password = yeetcodePasswordInput.value.trim();

        // Basic validation
        if (!yeetcode_username || !yeetcode_password) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    yeetcode_username,
                    yeetcode_password
                })
            });

            if (response.ok) {
                const data_obj = await response.json();
                // Store user data in chrome storage
                chrome.storage.local.set({
                    user: {
                        // yeetcode_id: data._id,
                        // yeetcode_username: data.yeetcode_username,
                        // leetcode_username: data.leetcode_username,
                        // token: data.token
                        username: yeetcode_username,
                        token: data_obj.data.token
                    }
                }, function() {
                    // Redirect to main screen after successful login
                    window.location.href = "main-screen.html";
                });
            } else {
                alert(data.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred during login. Please try again.");
        }
    });

    // Handle signup button click
    signupButton.addEventListener("click", function() {
        window.location.href = "signup-page-screen.html";
    });
});
