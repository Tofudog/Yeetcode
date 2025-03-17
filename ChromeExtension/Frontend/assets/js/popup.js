document.addEventListener("DOMContentLoaded", function () {
    // Only attach event listener if the button exists on the current page
    let back_to_main_button = document.getElementById("back-to-main-screen");
    if (back_to_main_button) {
        back_to_main_button.addEventListener("click", function () {
            window.location.href = "main-screen.html"; // Navigate back to main screen
        });
    }

    let create_team_button = document.getElementById("create-team-button");

    
    if (create_team_button) {
        create_team_button.addEventListener("click", () => {
            window.location.href = "create-team-screen.html";
        });
    }
    
    // Generate invitation code when on "create team" screen
    if (document.getElementById("inviteCode")) {
        import('./code_generator.js').then(({ default: generateRandomCode }) => {
            const code = generateRandomCode();
            document.getElementById("inviteCode").innerHTML = code;
        });
    }    

    // Allow user to copy the generated code
    let copyButton = document.getElementById("copyCode");
    if (copyButton) {
        copyButton.addEventListener("click", () => {
            const code = document.getElementById("inviteCode").textContent;
            navigator.clipboard.writeText(code).then(() => {
                // console.("Code copied!");
            });
        });
    }


    let join_team_button = document.getElementById("join-team-button");
    if (join_team_button) {
        join_team_button.addEventListener("click", function () {
            window.location.href = "join-team-screen.html"; // Navigate to Join Team page
        });
    }

    let start_game_button = document.getElementById("start-game-button");
    if (start_game_button) {
        start_game_button.addEventListener("click", function () {
            window.location.href = "game-play-screen.html"; // Navigate to Join Team page
        });
    }


});