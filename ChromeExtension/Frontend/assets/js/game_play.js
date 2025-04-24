import { sendGameProblems } from "../api/mongo_api.js";
// Get selected options from localStorage
let gameState = JSON.parse(localStorage.getItem('gameState'));
const selectedDifficulty = gameState.difficulty || "easy";
const selectedTime = gameState.timeLimit || "60";
const selectedProblemCount = gameState.problemCount|| 5;
const player1Name = localStorage.getItem("player1") || "Player 1";
const player2Name = localStorage.getItem("player2") || "Player 2";
const gameId = localStorage.getItem("gameId");
const battleType = gameState.battleType || "unknown" 

// Track selected problems for submission checking
let selectedProblems = [];

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

// Load problems from JSON file
async function loadProblems() {
    try {
        const response = await fetch('assets/data/problems.json');
        const data = await response.json();
        const problems = data[selectedDifficulty] || [];
        console.log(`Loaded ${problems.length} problems for difficulty: ${selectedDifficulty}`);
        return problems;    
    } catch (error) {
        console.error('Error loading problems:', error);
        return [];
    }
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
async function initializeGameTable(socket) {
    const problems = await loadProblems();
    const tableBody = document.querySelector('.game-table tbody');
    
    console.log(`Selected problem count: ${selectedProblemCount}`);
    selectedProblems = problems
    .sort(() => Math.random() - 0.5)
    .slice(0, selectedProblemCount);
    console.log('HEREE IS THE GAME ID::', gameId);
    console.log(`Selected ${selectedProblems.length} problems out of ${problems.length} available`);
    await sendGameProblems(selectedProblems, gameId);

    localStorage.setItem("selectedProblems", JSON.stringify(selectedProblems));

    // Prepare the message to send
    const message = JSON.stringify({
        type: "problems_sent_send_2",
        isPlayer1Api: localStorage.getItem("isPlayer1Api"), 
        isPlayer2Api: localStorage.getItem("isPlayer2Api"),
        gameState: JSON.parse(localStorage.getItem("gameState")),
        selectedProblems: JSON.parse(localStorage.getItem("selectedProblems")),
        gameId: gameId
    });

    // Check WebSocket state before sending
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.log("WebSocket not ready, waiting for connection...");
        // If socket isn't open yet, wait for it
        socket.addEventListener('open', function() {
            console.log("WebSocket now open, sending problems");
            socket.send(message);
        });
    }

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
document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_API = "https://yeetcode-81k4.onrender.com";
    const socket = new WebSocket("wss://yeetcode-81k4.onrender.com/ws");
    
    // Log WebSocket connection status for debugging
    socket.addEventListener('open', (event) => {
        console.log("WebSocket connection established successfully");
        socket.send(JSON.stringify({
            type: "connect",
            isPlayer1Api: localStorage.getItem("isPlayer1Api"), 
            isPlayer2Api: localStorage.getItem("isPlayer2Api"),
            gameId: gameId
        }));
    });

    socket.addEventListener('error', (event) => {
        console.error("WebSocket connection error:", event);
    });
    
    console.log(`Starting game with ${selectedProblemCount} problems`);
    
    // Initialize game table when socket is ready or when the connection is established
    if (socket.readyState === WebSocket.OPEN) {
        initializeGameTable(socket);
    } else {
        socket.addEventListener('open', () => {
            initializeGameTable(socket);
        });
    }

    //Listen for UI updates
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if(data.type === "updateUI_send_1_rebound") {
            localStorage.setItem("problemMapPlayer2", JSON.stringify(data.problemMapPlayer2));
            chrome.runtime.sendMessage({
                action: "updateUI_send_1_rebound_2", 
            });
        }
    }   

    //Send UI updates
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.action === "updateUI_send_2_rebound") {
            console.log("WE GOT HERE MESSAGE Sent")
            let socketPayload = {
                type: "updateUI_send_2_rebound",
                isPlayer1Api: localStorage.getItem("isPlayer1Api"),
                isPlayer2Api: localStorage.getItem("isPlayer2Api"),
                problemMapPlayer1: JSON.parse(localStorage.getItem("problemMapPlayer1")), 
                gameId: localStorage.getItem("gameId"),
            };
            
            // Check WebSocket state before sending
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(socketPayload));
            } else {
                console.error("WebSocket not ready, cannot send UI update");
            }
        }
    })
}); 