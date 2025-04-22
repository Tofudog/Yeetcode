import { userRecentSubmissions } from "../api/graphql_apis.js";
import { getNextTime, timeFormated, titleToSlug } from "./utils.js";

const NUM_USERS = 2;
let gameState = JSON.parse(localStorage.getItem("gameState"));

// Initialize time from localStorage or default to 10 minutes
var numMinutes = gameState.timeLimit|| 10;
var numSeconds = 0;

var gameOverPage = "game-over-lose.html";

function countCompletedProblems(playerIndex) {
    return window.currentCorrectSubmissions[playerIndex].filter(Boolean).length;
}

// Function to determine winner and handle game over
function handleGameOver() {
    const player1Completed = countCompletedProblems(0);
    const player2Completed = countCompletedProblems(1);
    
    console.log(`Player 1 completed: ${player1Completed}, Player 2 completed: ${player2Completed}`);
    
    // Determine winner
    let winner, loser;
    if (player1Completed > player2Completed) {
        winner = window.PLAYER1;
        loser = window.PLAYER2;
    } else if (player2Completed > player1Completed) {
        winner = window.PLAYER2;
        loser = window.PLAYER1;
    } else {
        // Tie - use time as tiebreaker
        winner = window.PLAYER1;
        loser = window.PLAYER2;
    }
    
    // Store loser's name for the animation
    console.log(`Setting loser name to: ${loser}`);
    localStorage.setItem("loserName", loser);
    
    // Add a small delay to ensure localStorage is updated
    setTimeout(() => {
        window.location.href = gameOverPage;
    }, 100);
}

function objectToMap(obj) {
    return new Map(Object.entries(obj));
}  

function logObject(obj) {
    for (const [key, value] of Object.entries(obj)) {
      console.log(`Key: ${key}, Value:`, value);
    }
}

// Update UI with submission status
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
                    box.innerHTML = '<img src="assets/images/checkmark.png" alt="✓" style="width: 30px; height: 30px;">';
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

        localStorage.setItem("problemMapPlayer1", JSON.stringify(problemMapPlayer1));

        console.log("We got to first send")
        chrome.runtime.sendMessage({
            action: "updateUI_send_2", 
        });
    }

    //console.log(`This is player2's map: ${problemMapPlayer2}`);
    console.log(objectToMap(problemMapPlayer2));
    logObject(problemMapPlayer2);

    if(Object.keys(problemMapPlayer2).length > 0) {
        let checkForWinner = 0;
        problemList.forEach((title, index) => {

            const slug = titleToSlug(title); 
            const status = problemMapPlayer2[slug];

            const boxId = `player2Box${index+1}`;
            const box = document.getElementById(boxId);

            if(box && status) {
                if(status === "Accepted") {
                    box.innerHTML = '<img src="assets/images/checkmark.png" alt="✓" style="width: 30px; height: 30px;">';
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
    
    }
}


document.addEventListener("DOMContentLoaded", function () {
    // Initialize timer display with selected time
    document.getElementById("timerText").innerText = timeFormated(numMinutes, numSeconds);
    const nextTime = getNextTime(numMinutes, numSeconds);
    const player1 = localStorage.getItem("player1");
    const player2 = localStorage.getItem("player2");

    let problemMapPlayer1 = {}
    let problemList = []


    numMinutes = nextTime[0];
    numSeconds = nextTime[1];

    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

        if (message.action === "triggerUserSubmissionAPICall") {

            console.log("Clicked on submit button");
            if(problemList.length === 0) {
                problemList = JSON.parse(localStorage.getItem("selectedProblems"))
            }

            if(Object.keys(problemMapPlayer1).length  === 0) {
                for (let i = 0; i < problemList.length; i++) {
                    let slug = titleToSlug(problemList[i]);
                    problemMapPlayer1[slug] = "in_progress";
                }
            }
            let recentSubmissions = await userRecentSubmissions(player1, 1);
            let title = titleToSlug(recentSubmissions[0].title);
            let timestamp = recentSubmissions[0].timestamp;
            let status = recentSubmissions[0].status;
            problemMapPlayer1[title] = status;

            updateUI(problemList, problemMapPlayer1, {});
        }

        if(message.action === "updateUI_send_1_rebound_3") {
            if(problemList.length === 0) {
                problemList = JSON.parse(localStorage.getItem("selectedProblems"))
            }

            let problemMapPlayer2 = JSON.parse(localStorage.getItem("problemMapPlayer2"))

            updateUI(problemList, {}, problemMapPlayer2);
        }
    });
});

var intervalTimer = setInterval(async function() {
    // Initialize timer display with selected time
    document.getElementById("timerText").innerText = timeFormated(numMinutes, numSeconds);
    const nextTime = getNextTime(numMinutes, numSeconds);
    const player1 = localStorage.getItem("player1");
    const player2 = localStorage.getItem("player2");

    let problemMapPlayer1 = {}
    let problemList = []


    numMinutes = nextTime[0];
    numSeconds = nextTime[1];

    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

        if (message.action === "triggerUserSubmissionAPICall") {

            console.log("Clicked on submit button");
            if(problemList.length === 0) {
                problemList = JSON.parse(localStorage.getItem("selectedProblems"))
            }

            if(Object.keys(problemMapPlayer1).length  === 0) {
                for (let i = 0; i < problemList.length; i++) {
                    let slug = titleToSlug(problemList[i]);
                    problemMapPlayer1[slug] = "in_progress";
                }
            }
            let recentSubmissions = await userRecentSubmissions(player1, 1);
            let title = titleToSlug(recentSubmissions[0].title);
            let timestamp = recentSubmissions[0].timestamp;
            let status = recentSubmissions[0].status;
            problemMapPlayer1[title] = status;

            updateUI(problemList, problemMapPlayer1, {});
        }

        if(message.action === "updateUI_send_1_rebound_3") {
            if(problemList.length === 0) {
                problemList = JSON.parse(localStorage.getItem("selectedProblems"))
            }

            let problemMapPlayer2 = JSON.parse(localStorage.getItem("problemMapPlayer2"))
            updateUI(problemList, {}, problemMapPlayer2);
        }
    });
    
    if (numMinutes === 0 && numSeconds === 0) {
        // Time's up - determine winner
        handleGameOver();
    } else {
        //update timer display
        document.getElementById("timerText").innerText = timeFormated(numMinutes, numSeconds);
    }
}, 1000);
