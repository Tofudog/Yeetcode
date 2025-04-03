// Leetcode user API functionality
//import getUserData from "./../../../Backend/leetcode_user.js";
// import { validateUser } from "./../../../Backend/utils/leetcodeGraphQLQueries.js";
import generateRandomCode from "../../../Backend/utils/code_generator.js";
import {validateUser} from "../api/graphql_apis.js";
import { userRecentSubmissions } from "../api/graphql_apis.js";

document.addEventListener("DOMContentLoaded", async function () {

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

    let start_game_button = document.getElementById("start-game-button");
    
    if (start_game_button) {
        start_game_button.addEventListener("click", async function () {
            //When the start button gets clicked on, the backend checks whether
            //the two inputted users are actually valid.
            //If a player is invalid, then the text box will notify it.
            const player1Input = document.getElementById("player1Name");
            const player2Input = document.getElementById("player2Name");

            const player1Name = player1Input.value;
            const player2Name = player2Input.value; 

            let isValid1 = await validateUser(player1Name);
            let isValid2 =  await validateUser(player2Name); 

            if(isValid1 && isValid2) {
                localStorage.setItem("Player1", player1Name);
                localStorage.setItem("Player2", player2Name);

                window.location.href = "game-play-screen.html"; // Navigate to Join Team page
            } 
            
            else if (isValid1 === true && isValid2 === false) {
                player1Input.style.border = "2px solid green"; 
                player2Input.style.border = "2px solid red"; 
                start_game_button = false;
            } 

            else if(isValid1 === false && isValid2 === true) {
                player1Input.style.border = "2px solid red"; 
                player2Input.style.border = "2px solid green"; 
                start_game_button = false;
            } 

            else {
                player1Input.style.border = "2px solid red"; 
                player2Input.style.border = "2px solid red"; 
                start_game_button = false;
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

     const toggleCheckbox = document.getElementById("toggle-note-checkbox");
    const noteContent = document.getElementById("note-content");

    function adjustNoteHeight() {
        if (toggleCheckbox.checked) {
            let availableHeight = window.innerHeight - noteContent.offsetTop - 20; // Calculate available height in the side panel
            noteContent.style.height = `${availableHeight}px`;
        } else {
            noteContent.style.height = "0px";
        }
    }

    // Adjust height when checkbox state changes
    toggleCheckbox.addEventListener("change", adjustNoteHeight);

    // Update height when the window is resized
    window.addEventListener("resize", adjustNoteHeight);


});