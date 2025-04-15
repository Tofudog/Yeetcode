document.addEventListener("DOMContentLoaded", () => {
    console.log("Game play screen loaded");
    
    // Initialize game state
    initializeGameState();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load game data from storage
    loadGameData();
});

function initializeGameState() {
    // Initialize game state variables
    window.gameState = {
        currentProblemIndex: 0,
        problems: [],
        player1Score: 0,
        player2Score: 0,
        timeRemaining: 0,
        gameStarted: false,
        gameEnded: false
    };
}

function setupEventListeners() {
    // Add event listeners for game controls
    const submitButton = document.getElementById("submit-button");
    if (submitButton) {
        submitButton.addEventListener("click", handleSubmission);
    }
    
    const nextButton = document.getElementById("next-button");
    if (nextButton) {
        nextButton.addEventListener("click", handleNextProblem);
    }
}

function loadGameData() {
    // Load game data from chrome.storage
    chrome.storage.local.get([
        'gameState',
        'gameDifficulty',
        'gameTime',
        'gameProblems',
        'gameProblemList'
    ], (result) => {
        console.log("Loaded game data:", result);
        
        if (!result.gameState) {
            console.error("No game state found in storage");
            return;
        }
        
        // Update player names
        updatePlayerNames(result.gameState);
        
        // Set up game problems
        if (result.gameProblemList) {
            window.gameState.problems = result.gameProblemList;
            window.gameState.timeRemaining = result.gameTime || 300; // Default to 5 minutes
            
            // Start the game
            startGame();
        } else {
            console.error("No problems found in storage");
        }
    });
}

function updatePlayerNames(gameState) {
    try {
        // Update player 1 name
        const player1NameElement = document.getElementById("player1-name");
        if (player1NameElement && gameState.player_1) {
            player1NameElement.textContent = gameState.player_1;
        } else {
            console.warn("Player 1 name element not found or player_1 not set");
        }
        
        // Update player 2 name
        const player2NameElement = document.getElementById("player2-name");
        if (player2NameElement && gameState.player_2) {
            player2NameElement.textContent = gameState.player_2;
        } else {
            console.warn("Player 2 name element not found or player_2 not set");
        }
        
        // Update scores
        const player1ScoreElement = document.getElementById("player1-score");
        if (player1ScoreElement) {
            player1ScoreElement.textContent = "0";
        } else {
            console.warn("Player 1 score element not found");
        }
        
        const player2ScoreElement = document.getElementById("player2-score");
        if (player2ScoreElement) {
            player2ScoreElement.textContent = "0";
        } else {
            console.warn("Player 2 score element not found");
        }
    } catch (error) {
        console.error("Error updating player names:", error);
    }
}

function startGame() {
    if (window.gameState.gameStarted) {
        console.log("Game already started");
        return;
    }
    
    window.gameState.gameStarted = true;
    
    // Load the first problem
    loadProblem(0);
    
    // Start the timer
    startTimer();
}

function loadProblem(index) {
    if (!window.gameState.problems || index >= window.gameState.problems.length) {
        console.error("Invalid problem index or no problems available");
        return;
    }
    
    const problem = window.gameState.problems[index];
    
    try {
        // Update problem description
        const problemDescriptionElement = document.getElementById("problem-description");
        if (problemDescriptionElement) {
            problemDescriptionElement.textContent = problem.description;
        } else {
            console.warn("Problem description element not found");
        }
        
        // Update problem title
        const problemTitleElement = document.getElementById("problem-title");
        if (problemTitleElement) {
            problemTitleElement.textContent = problem.title;
        } else {
            console.warn("Problem title element not found");
        }
        
        // Update problem difficulty
        const problemDifficultyElement = document.getElementById("problem-difficulty");
        if (problemDifficultyElement) {
            problemDifficultyElement.textContent = problem.difficulty;
        } else {
            console.warn("Problem difficulty element not found");
        }
        
        // Clear code editor
        const codeEditorElement = document.getElementById("code-editor");
        if (codeEditorElement) {
            codeEditorElement.value = problem.starterCode || "";
        } else {
            console.warn("Code editor element not found");
        }
        
        // Update problem counter
        const problemCounterElement = document.getElementById("problem-counter");
        if (problemCounterElement) {
            problemCounterElement.textContent = `Problem ${index + 1} of ${window.gameState.problems.length}`;
        } else {
            console.warn("Problem counter element not found");
        }
    } catch (error) {
        console.error("Error loading problem:", error);
    }
}

function startTimer() {
    if (window.gameState.timerInterval) {
        clearInterval(window.gameState.timerInterval);
    }
    
    window.gameState.timerInterval = setInterval(() => {
        if (window.gameState.timeRemaining <= 0) {
            endGame();
            return;
        }
        
        window.gameState.timeRemaining--;
        
        try {
            // Update timer display
            const timerElement = document.getElementById("timer");
            if (timerElement) {
                const minutes = Math.floor(window.gameState.timeRemaining / 60);
                const seconds = window.gameState.timeRemaining % 60;
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                console.warn("Timer element not found");
            }
        } catch (error) {
            console.error("Error updating timer:", error);
        }
    }, 1000);
}

function handleSubmission() {
    try {
        // Get code from editor
        const codeEditorElement = document.getElementById("code-editor");
        if (!codeEditorElement) {
            console.error("Code editor element not found");
            return;
        }
        
        const code = codeEditorElement.value;
        
        // TODO: Send code to backend for evaluation
        console.log("Submitting code:", code);
    } catch (error) {
        console.error("Error handling submission:", error);
    }
}

function handleNextProblem() {
    try {
        const nextIndex = window.gameState.currentProblemIndex + 1;
        if (nextIndex >= window.gameState.problems.length) {
            endGame();
            return;
        }
        
        window.gameState.currentProblemIndex = nextIndex;
        loadProblem(nextIndex);
    } catch (error) {
        console.error("Error handling next problem:", error);
    }
}

function endGame() {
    if (window.gameState.gameEnded) {
        console.log("Game already ended");
        return;
    }
    
    window.gameState.gameEnded = true;
    
    // Clear timer
    if (window.gameState.timerInterval) {
        clearInterval(window.gameState.timerInterval);
    }
    
    try {
        // TODO: Send final scores to backend
        console.log("Game ended. Final scores:", {
            player1: window.gameState.player1Score,
            player2: window.gameState.player2Score
        });
        
        // Show game over screen
        const gameOverScreen = document.getElementById("game-over-screen");
        if (gameOverScreen) {
            gameOverScreen.style.display = "block";
        } else {
            console.warn("Game over screen element not found");
        }
        
        // Update final scores
        const finalPlayer1ScoreElement = document.getElementById("final-player1-score");
        if (finalPlayer1ScoreElement) {
            finalPlayer1ScoreElement.textContent = window.gameState.player1Score;
        } else {
            console.warn("Final player 1 score element not found");
        }
        
        const finalPlayer2ScoreElement = document.getElementById("final-player2-score");
        if (finalPlayer2ScoreElement) {
            finalPlayer2ScoreElement.textContent = window.gameState.player2Score;
        } else {
            console.warn("Final player 2 score element not found");
        }
    } catch (error) {
        console.error("Error ending game:", error);
    }
} 