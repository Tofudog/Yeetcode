document.addEventListener("DOMContentLoaded", function () {
    const signupButton = document.querySelector(".signup-button");
    const yeetcodeUsernameInput = document.querySelector("input[placeholder='Enter New Yeetcode Username']");
    const yeetcodePasswordInput = document.querySelector("input[placeholder='Enter New Yeetcode Password']");
    const leetcodeUsernameInput = document.querySelector("input[placeholder='Enter Leetcode Username']");

    signupButton.addEventListener("click", async function() {
        const yeetcode_username = yeetcodeUsernameInput.value.trim();
        const yeetcode_password = yeetcodePasswordInput.value.trim();
        const leetcode_username = leetcodeUsernameInput.value.trim();

        // Basic validation
        if (!yeetcode_username || !yeetcode_password || !leetcode_username) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    yeetcode_username,
                    yeetcode_password,
                    leetcode_username
                })
            });

            const data = await response.json();
            console.log("Response data:", data); // Debug log

            if (response.ok) {
                // Store user data in chrome storage
                chrome.storage.local.set({
                    user: {
                        yeetcode_id: data._id,
                        yeetcode_username: data.yeetcode_username,
                        leetcode_username: data.leetcode_username,
                        token: data.token
                    }
                }, function() {
                    // Redirect to login page after successful signup
                    window.location.href = "login-page-screen.html";
                });
            } else {
                alert(data.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("An error occurred during signup. Please try again.");
        }
    });
}); 