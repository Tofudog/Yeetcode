import { userRecentSubmissions } from "../api/graphql_apis.js";
import { getNextTime, timeFormated, titleToSlug } from "./utils.js";

const NUM_USERS = 2;

const gameOverPage = "assets/yeet_motion_html_files/yeet_motion.html";
const gameOverPage2 = "assets/yeet_motion_html_files/rip_motion.html";

// let gameState = JSON.parse(localStorage.getItem("gameState"));
var numMinutes = 10;
var numSeconds = 0;


// Function to determine winner and handle game over
function handleGameOver() {
    const player1Completed = countCompletedProblems(0);
    const player2Completed = countCompletedProblems(1);
    
    console.log(`Player 1 completed: ${player1Completed}, Player 2 completed: ${player2Completed}`);
    
    // Determine winner
    let winner, loser;
    if (player1Completed > player2Completed) {
        winner = localStorage.getItem('Player1');
        loser = localStorage.getItem('Player2');
    } else if (player2Completed > player1Completed) {
        winner = localStorage.getItem('Player2');
        loser = localStorage.getItem('Player1');
    } else {
        // Tie - use time as tiebreaker
        winner = localStorage.getItem('Player1');
        loser = localStorage.getItem('Player2');
    }
    
    // Store loser's name for the animation
    console.log(`Setting loser name to: ${loser}`);
    localStorage.setItem("loserName", loser);
    
    // Add a small delay to ensure localStorage is updated
    setTimeout(() => {
        window.location.href = gameOverPage;
    }, 100);
}

function updateUI(problemList, problemMapPlayer1, problemMapPlayer2) {
    if(Object.keys(problemMapPlayer1).length > 0){
        let checkForWinner = 0;

        problemList.forEach((title, index) => {
            const slug = titleToSlug(title); 
            const status = problemMapPlayer1[slug];

            const boxId = `player1Box${index+1}`;
            const box = document.getElementById(boxId);

            if(box && status) {
                if(status === "Accepted") {
                    box.textContent = "🟢";
                    checkForWinner++;
                } else if(status === "in_progress") {

                } else{
                    box.textContent = "❌"
                }
            }
        })

        if(checkForWinner === problemList.length) {
            console.log("PLAYER 1 won!")
        } else {
            checkForWinner = 0;
        }
    }

    if(Object.keys(problemMapPlayer2).length > 0) {
        let checkForWinner = 0;
        problemList.forEach((title, index) => {

            const slug = titleToSlug(title); 
            const status = problemMapPlayer2[slug];

            const boxId = `player2Box${index+1}`;
            const box = document.getElementById(boxId);

            if(box && status) {
                if(status === "Accepted") {
                    box.textContent = "🟢";
                    checkForWinner++;
                } else if(status === "in_progress") {

                } else{
                    box.textContent = "❌"
                }
            }
        })

        if(checkForWinner === problemList.length) {
            console.log("PLAYER 2 won!")
        } else {
            checkForWinner = 0;
        }

        localStorage.setItem("problemMapPlayer2", JSON.stringify(problemMapPlayer2));
        chrome.runtime.sendMessage({
            action: "updateUI_send_1", 
        });

    }
}


document.addEventListener("DOMContentLoaded", function () {
    // Initialize timer display with selected time
    document.getElementById("timerText").innerText = timeFormated(numMinutes, numSeconds);
    // const nextTime = getNextTime(numMinutes, numSeconds);
    const player1 = localStorage.getItem("player1");
    const player2 = localStorage.getItem("player2");

    let problemMapPlayer2 = {}
    let problemList = []
    // numMinutes = nextTime[0];
    // numSeconds = nextTime[1];


    //LISTEN FOR LIVE UPDATES.
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.action === "triggerUserSubmissionAPICall") {
            if(problemList.length === 0) {
                problemList = JSON.parse(localStorage.getItem("selectedProblems"))
            }

            if(Object.keys(problemMapPlayer2).length === 0) {
                for (let i = 0; i < problemList.length; i++) {
                    let slug = titleToSlug(problemList[i]);
                    problemMapPlayer2[slug] = "in_progress";
                }
            }
            console.log("Clicked on submit button");
            console.log("THIS IS PROBLEM LIST", problemList);
            let recentSubmissions = await userRecentSubmissions(player2, 1);
            let title = titleToSlug(recentSubmissions[0].title);
            let timestamp = recentSubmissions[0].timestamp;
            let status = recentSubmissions[0].status;
            problemMapPlayer2[title] = status;

            updateUI(problemList, {}, problemMapPlayer2);
        }

        if(message.action === "updateUI_send_2_rebound_3") {
            if(problemList.length === 0) {
                problemList = JSON.parse(localStorage.getItem("selectedProblems"))
            }

            let problemMapPlayer1 = JSON.parse(localStorage.getItem("problemMapPlayer1"));

            updateUI(problemList, problemMapPlayer1, {});
        }
    });

});

