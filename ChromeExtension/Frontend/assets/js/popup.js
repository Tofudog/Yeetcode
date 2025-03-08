// Leetcode user API functionality
//import getUserData from "./../../../Backend/leetcode_user.js";
import isValid from "../../../Backend/utils/validateUser.js";

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
        create_team_button.addEventListener("click", function () {
            window.location.href = "create-team-screen.html"; // Navigate to Create Team page
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
            const player1Name = document.getElementById("player1Name").value;
            const player2Name = document.getElementById("player2Name").value;
            localStorage.setItem("Player1", player1Name);
            localStorage.setItem("Player2", player2Name);
            if (isValid(player1Name) && isValid(player2Name)) {
                window.location.href = "game-play-screen.html"; // Navigate to Join Team page
            }
            else {
                if (!isValid(player1Name)) {
                    document.getElementById("player1Name").value = `${player1Name} is not a Leetcode username. YEET!`;
                }
                if (!isValid(player2Name)) {
                    document.getElementById("player2Name").value = `${player2Name} is not a Leetcode username. YEET!`;
                }
            }
        });
    }


});