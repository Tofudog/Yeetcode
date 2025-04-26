import { userRecentSubmissions } from "../api/graphql_apis.js";
import { getNextTime, timeFormated, titleToSlug, updateRating } from "./utils.js";

const NUM_USERS = 2;
let gameState = JSON.parse(localStorage.getItem("gameState"));
let score = [0,0];
let yellowBoxes1 = new Set()
let yellowBoxes2 = new Set()
// Initialize time from localStorage or default to 10 minutes
var numMinutes = gameState.timeLimit|| 10;
var numSeconds = 0;

var gameOverPage = "assets/yeet_motion_html_files/yeet_motion.html";
const gameOverPage2 = "assets/yeet_motion_html_files/rip_motion.html";
const gameOverPageWin = "game-over-win.html";
const gameOverPageLose = "game-over-lose.html";

function countCompletedProblems(playerIndex) {
    return window.currentCorrectSubmissions[playerIndex].filter(Boolean).length;
}

async function getUserElo(yeetcode_username) {
    const response = await fetch("https://yeetcode-production-a720.up.railway.app/api/elo/getElo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            yeetcode_username: yeetcode_username
        })
    });
    const data = await response.json();
    return data.elo;
}

async function updateUserElo(yeetcode_username, newElo) {
    await fetch("https://yeetcode-production-a720.up.railway.app/api/elo/updateElo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            yeetcode_username: yeetcode_username,
            newElo: newElo
        })
    });
}

// Function to determine winner and handle game over
async function handleGameOver() {
    // Use the score variable instead of counting completed problems
    const player1Score = score[0];
    const player2Score = score[1];
    const yeetcode_username = localStorage.getItem("yeetcode_username");
    const curElo = await getUserElo(yeetcode_username);
    const oppElo = curElo;
    
    console.log(`Player 1 score: ${player1Score}, Player 2 score: ${player2Score}`);
    
    // Determine winner
    let winner, loser;
    if (player1Score > player2Score) {
        //You won, as you are player 1
        winner = window.PLAYER1;
        loser = window.PLAYER2;
        gameOverPage = gameOverPageWin;
        const newElo = updateRating(1, curElo, oppElo);
        await updateUserElo(yeetcode_username, newElo);
        localStorage.setItem("my-elo", newElo);
    } else if (player2Score > player1Score) {
        //You lost, as you are player 1
        winner = window.PLAYER2;
        loser = window.PLAYER1;
        gameOverPage = gameOverPageLose;
        const newElo = updateRating(-1, curElo, oppElo);
        await updateUserElo(yeetcode_username, newElo);
        localStorage.setItem("my-elo", newElo);
    } else {
        // Tie - use time as tiebreaker
        window.location.href = gameOverPage2;
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
                    box.textContent = "🟢";
                    checkForWinner++;

                    if(!(yellowBoxes1.has(boxId))) {
                        yellowBoxes1.add(boxId);
                        score[0]++;
                        document.getElementById("player1-score").innerText = score[0];
                        
                        // Check if player 1 has won
                        if (score[0] >= problemList.length) {
                            console.log("PLAYER 1 won by completing all problems!");
                            // Set player 2 as loser for the animation
                            localStorage.setItem("loserName", window.PLAYER2);
                            // Redirect to game over page
                            setTimeout(() => {
                                window.location.href = gameOverPage;
                            }, 100);
                            return;
                        }
                    }

                } else if(status === "in_progress") {

                } else{
                    box.textContent = "❌"
                }
            }
            
        })

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
                    box.textContent = "🟢";
                    checkForWinner++;
                    if(!(yellowBoxes2.has(boxId))) {
                        yellowBoxes2.add(boxId);
                        score[1]++;
                        document.getElementById("player2-score").innerText = score[1];
                        
                        // Check if player 2 has won
                        if (score[1] >= problemList.length) {
                            console.log("PLAYER 2 won by completing all problems!");
                            // Set player 1 as loser for the animation
                            localStorage.setItem("loserName", window.PLAYER1);
                            // Redirect to game over page
                            setTimeout(() => {
                                window.location.href = gameOverPage;
                            }, 100);
                            return;
                        }
                    }
                } else if(status === "in_progress") {

                } else{
                    box.textContent = "❌"
                }
            }
        })
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
