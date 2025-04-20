import { userRecentSubmissions } from "../api/graphql_apis.js";

const NUM_USERS = 2;

// Initialize time from gameState's timeLimit or default to 10 minutes
let gameState = JSON.parse(localStorage.getItem('gameState')) || {};
var numMinutes = gameState.timeLimit ? parseInt(gameState.timeLimit) : 10;
var numSeconds = 0;

const gameOverPage = "assets/yeet_motion_html_files/yeet_motion.html";

// Function to count completed problems for a player
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

document.addEventListener("DOMContentLoaded", function () {
    // Initialize timer display with selected time
    document.getElementById("timerText").innerText = timeFormated(numMinutes, numSeconds);
    console.log(`Timer initialized with ${numMinutes} minutes from gameState`);
});

function getNextTime(minutes, seconds) {
    //precondition: minutes and/or seconds > 0
    if (seconds === 0) {
        if (minutes === 0) {
            return [0, 0]; // prevent negative time
        }
        --minutes;
        seconds = 59;
    } else {
        --seconds;
    }
    return [minutes, seconds];
}

function timeFormated(minutes, seconds) {
    //0 <= minutes, seconds < 60
    var timeOutput = ``;
    if (minutes < 10) {timeOutput += `0`;}
    timeOutput += `${minutes}:`;
    if (seconds < 10) {timeOutput += `0`;}
    timeOutput += `${seconds}`;
    return timeOutput;
}

function titleToSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

var intervalTimer = setInterval(async function() {
    const nextTime = getNextTime(numMinutes, numSeconds);
    numMinutes = nextTime[0];
    numSeconds = nextTime[1];

    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.action === "triggerUserSubmissionAPICall") {
            console.log("Clicked on submit button");
            //I don't want to run these few lines more than once!
            //so maybe make window.PROBLEM_TO_HASH and window.USER_TO_HASH a thing
            const problemList = window.PROBLEM_LIST;
            const NUM_PROBLEMS = problemList.length;
            let userList = [window.PLAYER1, window.PLAYER2];
            let userToHash = new Map();  //assign each user a number
            let problemToHash = new Map();  //assign each problem a number 
            for (var i = 0; i < NUM_USERS; i++) {
                userToHash.set(userList[i], i);
            }
            for (var i = 0; i < NUM_PROBLEMS; i++) {
                problemToHash.set(problemList[i], i);
            }

            // Check if submission has changed
            for (const PLAYER of userList) {
                const recentSubmissions = await userRecentSubmissions(PLAYER, 1);
                const title = titleToSlug(recentSubmissions[0].title);
                const timestamp = recentSubmissions[0].timestamp;
                const status = recentSubmissions[0].status;
                
                const playerIdx = userToHash.get(PLAYER);
                let titleIdx = null;
                if (problemToHash.has(title)) {
                    titleIdx = problemToHash.get(title);
                }
                else {
                    //edge case: current player solved a problem not on the sheet
                    continue;
                }

                const boxId = `player${playerIdx + 1}Box${titleIdx + 1}`;
                const box = document.getElementById(boxId);
                if (box) {
                    if (status == "Accepted") {
                        currentCorrectSubmissions[playerIdx][titleIdx] = true;
                        box.innerHTML = '<img src="assets/images/checkmark.png" alt="✓" style="width: 30px; height: 30px;">';
                    }
                    else {
                        box.innerHTML = '<img src="assets/images/xmark.png" alt="x" style="width: 30px; height: 30px;">';
                    }
                    console.log(currentCorrectSubmissions);
                }
            }

            // Check if any player has completed all problems
            for (var i = 0; i < NUM_USERS; i++) {
                if (window.currentCorrectSubmissions[i].every(Boolean)) {
                    handleGameOver();
                    return;
                }
            }
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
