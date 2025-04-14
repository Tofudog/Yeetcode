// Get game data from chrome.storage
let player1Name = "";
let player2Name = "";
let selectedDifficulty = "easy";
let selectedTime = 60;
let selectedProblemCount = 5;

// Initialize game data from storage
chrome.storage.local.get(['gameState', 'user', 'player_1', 'player_2', 'gameStarted'], (result) => {
    console.log("Retrieved game data from storage:", result);
    
    // Try multiple ways to get player names
    if (result.gameState && result.gameState.player_1 && result.gameState.player_2) {
        // Method 1: From gameState object
        player1Name = result.gameState.player_1;
        player2Name = result.gameState.player_2;
        console.log("Player names from gameState:", player1Name, player2Name);
    } else if (result.player_1 && result.player_2) {
        // Method 2: From direct storage properties
        player1Name = result.player_1;
        player2Name = result.player_2;
        console.log("Player names from direct properties:", player1Name, player2Name);
    } else if (result.user) {
        // Method 3: From user object (for Player 1)
        player1Name = result.user.username || "Player 1";
        
        // Try to get player 2 from storage
        chrome.storage.local.get(['player_2'], (playerResult) => {
            player2Name = playerResult.player_2 || "Player 2";
            console.log("Player names from user and player_2:", player1Name, player2Name);
            
            // Store in localStorage for compatibility with existing code
            localStorage.setItem("Player1", player1Name);
            localStorage.setItem("Player2", player2Name);
            
            // Get game settings and initialize
            initializeWithSettings();
        });
        return; // Exit early, we'll initialize in the callback
    } else {
        // Method 4: Fallback to defaults
        player1Name = "Player 1";
        player2Name = "Player 2";
        console.log("Using default player names:", player1Name, player2Name);
    }
    
    // Store in localStorage for compatibility with existing code
    localStorage.setItem("Player1", player1Name);
    localStorage.setItem("Player2", player2Name);
    
    // Get game settings and initialize
    initializeWithSettings();
});

// Function to initialize with game settings
function initializeWithSettings() {
    // Get game settings
    chrome.storage.local.get(['gameDifficulty', 'gameTime', 'gameProblems'], (settingsResult) => {
        console.log("Retrieved game settings:", settingsResult);
        
        if (settingsResult.gameDifficulty) selectedDifficulty = settingsResult.gameDifficulty;
        if (settingsResult.gameTime) selectedTime = settingsResult.gameTime;
        if (settingsResult.gameProblems) selectedProblemCount = settingsResult.gameProblems;
        
        // Initialize the game table with the retrieved data
        initializeGameTable();
    });
}

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
    
    console.log("Updated player names in table:", player1Name, player2Name);

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
    console.log("Game play screen loaded");
    
    // Listen for submission updates from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'submissionUpdate') {
            console.log("Received submission update:", message.submissions);
            updateSubmissionUI(message.submissions);
        }
    });
}); 