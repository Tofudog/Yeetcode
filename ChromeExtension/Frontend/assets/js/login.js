async function getUserElo(yeetcode_username) {
    const response = await fetch("https://yeetcode-81k4.onrender.com/api/elo/getElo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            yeetcode_username
        })
    });
    if (response.ok) {
        const data = await response.json();
        return data.elo;
    }
    return "response.elo;";
}

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
            const response = await fetch("https://yeetcode-81k4.onrender.com/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    yeetcode_username,
                    yeetcode_password
                })
            });

            const data = await response.json();
            console.log("Login response:", data); // Debug log

            if (response.ok) {
                //make api calls
                const elo = await getUserElo(yeetcode_username);
                const title = "Pupil";
                const bio = "";
                const uni = "";
                localStorage.clear();
                localStorage.setItem("leetcode_username", data.leetcode_username);
                localStorage.setItem("yeetcode_username", yeetcode_username);
                localStorage.setItem("elo", elo);
                localStorage.setItem("title", title);
                localStorage.setItem("bio", bio);
                localStorage.setItem("university", uni);
                window.location.href = "main-screen.html";
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
