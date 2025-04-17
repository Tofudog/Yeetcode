import { userRecentSubmissions } from "../api/graphql_apis.js";
import { getNextTime, timeFormated, titleToSlug } from "./utils.js";
import handleGameOver from "./gameOver.js";

const NUM_USERS = 2;
var NUM_MINUTES = parseInt(localStorage.getItem("gameTime")) || 10;
var NUM_SECONDS = 0;

function countCompletedProblems(playerIndex) {
    return window.currentCorrectSubmissions[playerIndex].filter(Boolean).length;
}

// Function to update the UI with submission status
function updateSubmissionUI(playerIdx, titleIdx, status) {
    const boxId = `player${playerIdx + 1}Box${titleIdx + 1}`;
    const box = document.getElementById(boxId);
    if (box) {
        if (status === "Accepted") {
            box.innerHTML = '<img src="assets/images/checkmark.png" alt="✓" style="width: 30px; height: 30px;">';
        }
        else {
            box.innerHTML = '<img src="assets/images/xmark.png" alt="x" style="width: 30px; height: 30px;">';
        }
    }
}

var intervalTimer = setInterval(async function() {
    const nextTime = getNextTime(NUM_MINUTES, NUM_SECONDS);
    NUM_MINUTES = nextTime[0];
    NUM_SECONDS = nextTime[1];

    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.action === "triggerUserSubmissionAPICall") {
            console.log("Clicked on submit button");
            let userList = [window.PLAYER1, window.PLAYER2];
            let userToHash = new Map(); let problemToHash = new Map();
            for (var i = 0; i < NUM_USERS; i++) {userToHash.set(userList[i], i);}
            for (var i = 0; i < window.PROBLEM_LIST.length; i++) {problemToHash.set(window.PROBLEM_LIST[i], i);}

            // Check if submission has changed
            for (const PLAYER of userList) {
                const recentSubmissions = await userRecentSubmissions(PLAYER, 1);
                const title = titleToSlug(recentSubmissions[0].title);
                const status = recentSubmissions[0].status;
                let playerIdx = userToHash.get(PLAYER);
                let titleIdx = null;
                if (problemToHash.has(title)) {
                    titleIdx = problemToHash.get(title);
                    if (status === "Accepted") {
                        currentCorrectSubmissions[playerIdx][titleIdx] = true;
                    }
                }
                updateSubmissionUI(playerIdx, titleIdx, status)
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
    
    if (NUM_MINUTES === 0 && NUM_SECONDS === 0) {
        handleGameOver();
    } else {
        document.getElementById("timerText").innerText = timeFormated(NUM_MINUTES, NUM_SECONDS);
    }
}, 1000);
