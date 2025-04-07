// Leetcode user API functionality
//import getUserData from "./../../../Backend/leetcode_user.js";
import { validateUser } from "./../../../Backend/utils/leetcodeGraphQLQueries.js";
import generateRandomCode from "../../../Backend/utils/code_generator.js";

document.addEventListener("DOMContentLoaded", function () {

    // Only attach event listener if the button exists on the current page
    let back_to_main_button = document.getElementById("back-to-main-screen");
    if (back_to_main_button) {
        back_to_main_button.addEventListener("click", function () {
            window.location.href = "main-screen.html"; // Navigate back to main screen
        });
    }

    let back_to_main_button_from_join = document.getElementById("back-to-main-screen-from-join");
    if (back_to_main_button_from_join) {
        back_to_main_button_from_join.addEventListener("click", function () {
            window.location.href = "main-screen.html"; // Navigate back to main screen
        });
    }

    let create_team_button = document.getElementById("create-team-button");
    if (create_team_button) {
        create_team_button.addEventListener("click", function () {
            const gameCode = generateRandomCode();
            localStorage.setItem("gameCode", gameCode);
            window.location.href = "create-team-screen.html"; // Navigate to Create Team page
        });
    }

    let join_team_button = document.getElementById("join-team-button");
    if (join_team_button) {
        join_team_button.addEventListener("click", function () {
            window.location.href = "join-team-screen.html"; // Navigate to Join Team page
        });
    }

    // Add profile button handler
    let view_profile_button = document.getElementById("view-profile-button");
    if (view_profile_button) {
        view_profile_button.addEventListener("click", async function() {
            // If we're on the main screen, prompt for username
            const username = localStorage.getItem("currentPlayer") || 
                           prompt("Please enter your Leetcode username:");
            
            if (username) {
                try {
                    const isValid = await validateUser(username);
                    if (isValid) {
                        localStorage.setItem("currentPlayer", username);
                        window.location.href = "profile-screen.html";
                    } else {
                        alert("Invalid Leetcode username. Please try again.");
                    }
                } catch (error) {
                    console.error("Error validating user:", error);
                    alert("Error validating username. Please try again.");
                }
            }
        });
    }

    let start_game_button = document.getElementById("start-game-button");
    if (start_game_button) {
        start_game_button.addEventListener("click", async function () {
            //When the start button gets clicked on, the backend checks whether
            //the two inputted users are actually valid.
            //If a player is invalid, then the text box will notify it.
            const player1Name = document.getElementById("player1Name").value;
            const player2Name = document.getElementById("player2Name").value;
            localStorage.setItem("Player1", player1Name);
            localStorage.setItem("Player2", player2Name);
            let validPlayer1 = await validateUser(player1Name);
            let validPlayer2 = await validateUser(player2Name);
            if (validPlayer1 && validPlayer2) {
                window.location.href = "game-setup-screen.html"; // Navigate to game setup screen
            }
            else {
                console.log(`Is ${player1Name} an actual Leetcode user? ${validPlayer1}`);
                if (!validPlayer1) {
                    document.getElementById("player1Name").value = `${player1Name} is not a Leetcode username. YEET!`;
                }
                if (!validPlayer2) {
                    document.getElementById("player2Name").value = `${player2Name} is not a Leetcode username. YEET!`;
                }
            }
        });
    }

    let game_code_text = document.getElementById("inviteCode");
    if (game_code_text) {
        const gameCode = localStorage.getItem("gameCode");
        game_code_text.innerText = gameCode;
        //then add this game code (with other features like player)
        //to the list of currently available games
    }

    // Note panel functionality
    const toggleCheckbox = document.getElementById("toggle-note-checkbox");
    const noteContent = document.getElementById("note-content");

    function adjustNoteHeight() {
        if (toggleCheckbox && noteContent) {
            if (toggleCheckbox.checked) {
                let availableHeight = window.innerHeight - noteContent.offsetTop - 20;
                noteContent.style.height = `${availableHeight}px`;
            } else {
                noteContent.style.height = "0px";
            }
        }
    }

    // Adjust height when checkbox state changes
    if (toggleCheckbox) {
        toggleCheckbox.addEventListener("change", adjustNoteHeight);
    }

    // Update height when the window is resized
    window.addEventListener("resize", adjustNoteHeight);
});