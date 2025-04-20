// Get selected options from localStorage
const player1Name = localStorage.getItem("Player1");
const player2Name = localStorage.getItem("Player2");
const gameId = localStorage.getItem("gameId");

// Track selected problems for submission checking
let selectedProblems = [];

// Get game settings from storage
let selectedProblemCount;

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
    const socket = new WebSocket("ws://localhost:3000/ws");
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "connect",
            isPlayer1Api: localStorage.getItem("isPlayer1Api"), 
            isPlayer2Api: localStorage.getItem("isPlayer2Api")
        }))
    }

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "problems_sent_send_2") {
            console.log("Problems sent over successfully");
            localStorage.setItem("gameState", JSON.stringify(data.gameState));
            localStorage.setItem("selectedProblems", JSON.stringify(data.selectedProblems));
        }
        await getGameSettings();
        await initializeGameTable();
    }
    console.log(`Starting game with ${selectedProblemCount} problems`);
}); 

