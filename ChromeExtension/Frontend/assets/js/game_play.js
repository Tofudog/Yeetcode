// Get selected options from localStorage
const selectedDifficulty = localStorage.getItem("gameDifficulty") || "easy";
const selectedTime = localStorage.getItem("gameTime") || "60";
const selectedProblemCount = parseInt(localStorage.getItem("gameProblems")) || 5;
const player1Name = localStorage.getItem("Player1") || "Player 1";
const player2Name = localStorage.getItem("Player2") || "Player 2";

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
async function initializeGameTable() {
    const problems = await loadProblems();
    const tableBody = document.querySelector('.game-table tbody');
    
    console.log(`Selected problem count: ${selectedProblemCount}`);
    
    // Randomly select problems based on count
    selectedProblems = problems
        .sort(() => Math.random() - 0.5)
        .slice(0, selectedProblemCount);
    
    console.log(`Selected ${selectedProblems.length} problems out of ${problems.length} available`);
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows
    selectedProblems.forEach((problemId, index) => {
        tableBody.innerHTML += createProblemRow(problemId, index);
    });
    
    // Update player names in the table header
    document.getElementById("gamePlayer1").textContent = player1Name;
    document.getElementById("gamePlayer2").textContent = player2Name;

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

// Update UI with submission status
function updateSubmissionUI(submissions) {
    console.log("Updating UI with submissions:", submissions);
    submissions.forEach((playerSubmissions, playerIndex) => {
        playerSubmissions.forEach((isCorrect, problemIndex) => {
            const boxId = `player${playerIndex + 1}Box${problemIndex + 1}`;
            const box = document.getElementById(boxId);
            if (box) {
                box.textContent = isCorrect ? '🟢' : '🟡';
            }
        });
        
        // Update the score display for each player
        const scoreElement = document.getElementById(`player${playerIndex + 1}-score`);
        if (scoreElement) {
            const totalSolved = playerSubmissions.filter(Boolean).length;
            console.log(`Player ${playerIndex + 1} solved ${totalSolved} problems`);
            scoreElement.textContent = totalSolved;
        }
    });
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log(`Starting game with ${selectedProblemCount} problems`);
    initializeGameTable();
    
    // Listen for submission updates from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'submissionUpdate') {
            console.log("Received submission update:", message.submissions);
            updateSubmissionUI(message.submissions);
        }
    });
}); 
