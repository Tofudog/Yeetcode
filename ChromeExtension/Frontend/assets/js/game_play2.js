import { userRecentSubmissions } from "../api/graphql_apis.js";
import { getNextTime, timeFormated, titleToSlug, updateRating } from "./utils.js";

const player1Name = localStorage.getItem("player1") || "Player 1";
const player2Name = localStorage.getItem("player2") || "Player 2";
const gameId = localStorage.getItem("gameId");
const BACKEND_API = "https://yeetcode-production-a720.up.railway.app";
const socket = new WebSocket("wss://yeetcode-production-a720.up.railway.app/ws");
const NUM_USERS = 2;
var gameOverPage = "assets/yeet_motion_html_files/yeet_motion.html";
const gameOverPage2 = "assets/yeet_motion_html_files/rip_motion.html";
const gameOverPageWin = "game-over-win.html";
const gameOverPageLose = "game-over-lose.html";

let selectedProblems = [];
let selectedProblemCount;
let score = [0, 0];
let yellowBoxes1 = new Set();
let yellowBoxes2 = new Set();




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
        //You lost, as you are player 2
        winner = window.PLAYER1;
        loser = window.PLAYER2;
        gameOverPage = gameOverPageLose;
        const newElo = updateRating(-1, curElo, oppElo);
        await updateUserElo(yeetcode_username, newElo);
    } else if (player2Score > player1Score) {
        //You won, as you are player 2
        winner = window.PLAYER2;
        loser = window.PLAYER1;
        gameOverPage = gameOverPageWin;
        const newElo = updateRating(1, curElo, oppElo);
        await updateUserElo(yeetcode_username, newElo);
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

function updateUI(problemList, problemMapPlayer1, problemMapPlayer2) {
    if (typeof problemList === 'string') {
        problemList = JSON.parse(problemList);
    }
    const n = problemList.length;

    console.log(problemList);
    console.log(`Printing out map2 bruge: ${problemMapPlayer2}`);

    if(problemMapPlayer1.length > 0){
        const parsedObj = JSON.parse(problemMapPlayer1); // now it's a plain object
        const mapPlayer1 = new Map(Object.entries(parsedObj)); // now it's a Map
        problemMapPlayer1 = mapPlayer1;

        let checkForWinner = 0;
        //console.log(`brig: ${problemMapPlayer1}`);
        for (var index=0; index<n; index++) {
            const slug = String(problemList[index]);
            let status = problemMapPlayer1.get(slug);

            console.log(`${slug} ---> ${status}`);

            const boxId = `player1Box${index+1}`;
            const box = document.getElementById(boxId);
            //console.log(`Here is the box: ${box}; for problem ${slug}, here is the status: ${status}`);

            if(box && status) {
                if(status === "Accepted") {
                    box.textContent = "🟢";     
                    checkForWinner++;

                    if(!(yellowBoxes1.has(boxId))) {
                        yellowBoxes1.add(boxId);
                        score[0]++;
                        document.getElementById("player1-score").innerText = score[0];
                        
                        // Check if player 1 won by completing all problems
                        if (score[0] >= n) {
                            console.log("PLAYER 1 won by completing all problems!");
                            // Set player 2 as loser for the animation
                            localStorage.setItem("loserName", player2Name);
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
        }
    }

    let checkForWinner = 0;
    //console.log(`brig: ${problemMapPlayer1}`);
    for (var index=0; index<n; index++) {
        const slug = String(problemList[index]);
        let status = problemMapPlayer2[slug];

        console.log(`${slug} ---> ${status}`);

        const boxId = `player2Box${index+1}`;
        const box = document.getElementById(boxId);
        //console.log(`Here is the box: ${box}; for problem ${slug}, here is the status: ${status}`);

        if(box && status) {
            if(status === "Accepted") {
                box.textContent = "🟢";                    
                checkForWinner++;

                if(!(yellowBoxes2.has(boxId))) {
                    yellowBoxes2.add(boxId);
                    score[1]++;
                    document.getElementById("player2-score").innerText = score[1];
                    
                    // Check if player 2 won by completing all problems
                    if (score[1] >= n) {
                        console.log("PLAYER 2 won by completing all problems!");
                        // Set player 1 as loser for the animation
                        localStorage.setItem("loserName", player1Name);
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
    }
}


async function getGameSettings() {
    try {
        let gameState = JSON.parse(localStorage.getItem('gameState'));

        if (gameState.status === 'in_progress') {
            selectedProblemCount = gameState.problemCount;
            console.log("Selected problem count:", selectedProblemCount);
        } else {
            console.error("No game settings found");
            selectedProblemCount = 3; // Default value
        }
    } catch (error) {
        console.error("Error getting game settings:", error);
        selectedProblemCount = 3; // Default value
    }
}

// Generate URL from problem ID
function generateProblemUrl(problemId) {
    return `https://leetcode.com/problems/${problemId}/description/`;
}

// Format problem title from ID
function formatProblemTitle(problemId) {
    return problemId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


// Create problem row HTML
function createProblemRow(problemId, index) {
    return `
        <tr>
            <td>
                <a href="${generateProblemUrl(problemId)}" target="_blank" class="problem-link">
                    ${formatProblemTitle(problemId)}
                </a>
            </td>
            <td id="player1Box${index + 1}" class="player1">🟡</td>
            <td id="player2Box${index + 1}" class="player2">🟡</td>
        </tr>
    `;
}

// Initialize game table
async function initializeGameTable() {
    let problems = JSON.parse(localStorage.getItem("selectedProblems"));
    const tableBody = document.querySelector('.game-table tbody');
    
    console.log(`Selected problem count: ${problems.length}`);

    const isPlayer1Api = localStorage.getItem("isPlayer1Api")
    const isPlayer2Api = localStorage.getItem("isPlayer2Api")
  
    selectedProblems = problems; 
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows
    selectedProblems.forEach((problemId, index) => {
        tableBody.innerHTML += createProblemRow(problemId, index);
    });
    
    // Update player names in the table header
    document.getElementById("gamePlayer1").textContent = localStorage.getItem("player1");
    document.getElementById("gamePlayer2").textContent = localStorage.getItem("player2");

    // Initialize submission tracking array
    window.currentCorrectSubmissions = Array(2).fill().map(() => Array(selectedProblemCount).fill(false));
    
    // Store selected problem IDs for submission checking
    window.PROBLEM_LIST = selectedProblems;
    
    // Update global player variables for timer.js
    window.PLAYER1 = player1Name;
    window.PLAYER2 = player2Name;
    
    // Update number of problems for timer.js
    window.NUM_PROBLEMS = selectedProblemCount;

    // Store game start time in milliseconds
    window.GAME_START_TIME = Date.now();
    console.log("Game start time set to:", new Date(window.GAME_START_TIME).toISOString());
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', async () => {
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "connect",
            isPlayer1Api: localStorage.getItem("isPlayer1Api"),
            isPlayer2Api: localStorage.getItem("isPlayer2Api"),
            gameId: gameId
        }))
    }

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "problems_sent_send_2") {
            console.log("Problems sent over successfully");
            localStorage.setItem("gameState", JSON.stringify(data.gameState));
            localStorage.setItem("selectedProblems", JSON.stringify(data.selectedProblems));
            await getGameSettings();
            await initializeGameTable();
            console.log(`Starting game with ${selectedProblemCount} problems`);
            await startTimer();
        }
        if(data.type === "updateUI_send_2_rebound") {
            localStorage.setItem("problemMapPlayer1", JSON.stringify(data.problemMapPlayer1));
            chrome.runtime.sendMessage({
                action: "updateUI_send_2_rebound_2", 
            });
        }
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.action === "updateUI_send_1_rebound") {
            let socketPayload = {
                type: "updateUI_send_1_rebound",
                problemMapPlayer2: JSON.parse(localStorage.getItem("problemMapPlayer2")), 
                isPlayer1Api: localStorage.getItem("isPlayer1Api"), 
                isPlayer2Api: localStorage.getItem("isPlayer2Api"),
                gameId: localStorage.getItem("gameId"),
            };
            
            socket.send(JSON.stringify(socketPayload));
        }
    })

});

async function startTimer() {
    const gameState = JSON.parse(localStorage.getItem("gameState"));
    var numMinutes = parseInt(gameState.timeLimit);
    var numSeconds = 0;
    document.getElementById("timerText").innerText = timeFormated(numMinutes, numSeconds);

    const player1 = localStorage.getItem("player1");
    const player2 = localStorage.getItem("player2");

    var intervalTimer = setInterval(async function() {
        let problemMapPlayer2 = {}
        let problemList = []

        const nextTime = getNextTime(numMinutes, numSeconds);
        numMinutes = nextTime[0];
        numSeconds = nextTime[1];
        document.getElementById("timerText").innerText = timeFormated(numMinutes, numSeconds);

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if(data.type === "updateUI_send_2_rebound") {
                localStorage.setItem("problemMapPlayer1", JSON.stringify(data.problemMapPlayer1));
                //console.log(`Here is mappp: ${localStorage.getItem("problemMapPlayer1")}`);
                updateUI(localStorage.getItem("selectedProblems"), localStorage.getItem("problemMapPlayer1"), {});
                chrome.runtime.sendMessage({
                    action: "updateUI_send_2_rebound_2", 
                });
            }
        }
    
        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.action === "triggerUserSubmissionAPICall") {
                console.log("Clicked on submit button");
                if(problemList.length === 0) {
                    problemList = JSON.parse(localStorage.getItem("selectedProblems"))
                }
                if(Object.keys(problemMapPlayer2).length  === 0) {
                    for (let i = 0; i < problemList.length; i++) {
                        let slug = titleToSlug(problemList[i]);
                        problemMapPlayer2[slug] = "in_progress";
                    }
                }
                let recentSubmissions = await userRecentSubmissions(player2, 1);
                let title = titleToSlug(recentSubmissions[0].title);
                let timestamp = recentSubmissions[0].timestamp;
                let status = recentSubmissions[0].status;
                problemMapPlayer2[title] = status;
                updateUI(problemList, {}, problemMapPlayer2);
                console.log("about to try out sending message to screen1 from player2 submit");
                console.log(`P2 map yuuuu: ${problemMapPlayer2}`);
                let socketPayload = {
                    type: "updateUI_send_1_rebound",
                    problemMapPlayer2: problemMapPlayer2, 
                    isPlayer1Api: localStorage.getItem("isPlayer1Api"), 
                    isPlayer2Api: localStorage.getItem("isPlayer2Api"),
                    gameId: localStorage.getItem("gameId"),
                };
                socket.send(JSON.stringify(socketPayload));
            }
    
            if(message.action === "updateUI_send_1_rebound_3") {
                if(problemList.length === 0) {
                    problemList = JSON.parse(localStorage.getItem("selectedProblems"))
                }
    
                let problemMapPlayer2 = JSON.parse(localStorage.getItem("problemMapPlayer2"))
                updateUI(problemList, {}, problemMapPlayer2);
                console.log("333about to try out sending message to screen1 from player2 submit");
                console.log(`P3332 map yuuuu: ${localStorage.getItem("problemMapPlayer2")}`);
            }
        });

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if(request.action === "updateUI_send_1_rebound") {
                let socketPayload = {
                    type: "updateUI_send_1_rebound",
                    problemMapPlayer2: JSON.parse(localStorage.getItem("problemMapPlayer2")), 
                    isPlayer1Api: localStorage.getItem("isPlayer1Api"), 
                    isPlayer2Api: localStorage.getItem("isPlayer2Api"),
                    gameId: localStorage.getItem("gameId"),
                };
                
                socket.send(JSON.stringify(socketPayload));
            }
        })
        
        if (numMinutes === 0 && numSeconds === 0) {
            // Time's up - determine winner
            handleGameOver();
        } else {
            //update timer display
            document.getElementById("timerText").innerText = timeFormated(numMinutes, numSeconds);
        }
    }, 1000);
}

