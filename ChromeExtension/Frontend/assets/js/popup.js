import generateRandomCode from "./code_generator.js";

// const BACKEND_API = "https://yeetcode-1.onrender.com";
// const socket = new WebSocket(BACKEND_API.replace(/^http/, "ws") + "/ws");
const BACKEND_API = "http://localhost:3000";
const socket = new WebSocket("ws://localhost:3000/ws");


// Add connection state tracking
let isSocketConnected = false;

socket.onopen = () => {
    console.log("WebSocket connected");
    isSocketConnected = true;
};

socket.onclose = () => {
    console.log("WebSocket disconnected");
    isSocketConnected = false;
};

// Helper function to send WebSocket messages
function sendWebSocketMessage(message) {
    if (isSocketConnected) {
        socket.send(JSON.stringify(message));
    } else {
        console.log("WebSocket not connected, retrying in 1 second...");
        setTimeout(() => sendWebSocketMessage(message), 1000);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // UI Elements
    const createTeamButton = document.getElementById("create-team-button");
    const joinTeamButton = document.getElementById("join-team-button");
    const startGameButton = document.getElementById("start-game-button");
    const copyCodeButton = document.getElementById("copyCode");
    const inviteCodeElement = document.getElementById("inviteCode");
    const player2Container = document.getElementById("player2-container");
    const confirmJoinButton = document.getElementById("confirm-join");
    const back_to_main_button = document.getElementById("back-to-main-screen");
    const back_to_main_button_from_join = document.getElementById("back-to-main-screen-from-join");

    // Check if user is logged in and display username
    chrome.storage.local.get(['user'], (result) => {
        if (!result.user || !result.user.loggedIn) {
            window.location.href = "login-page-screen.html";
            return;
        }

        // Display logged-in username for both Player1 and Player2 displays
        const player1NameDisplay = document.getElementById('player1Name');
        const player2NameDisplay = document.getElementById('player2Name');
        
        if (player1NameDisplay) {
            player1NameDisplay.textContent = result.user.leetcodeId;
        }
        if (player2NameDisplay) {
            player2NameDisplay.textContent = result.user.leetcodeId;
        }
    });

    // Navigate back to main screen
    if (back_to_main_button) {
        back_to_main_button.addEventListener("click", () => {
            window.location.href = "main-screen.html";
        });
    }

    if (back_to_main_button_from_join) {
        back_to_main_button_from_join.addEventListener("click", () => {
            window.location.href = "main-screen.html";
        });
    }
    
    let gameId;
    let isPlayer2 = false;

    // Fetch game state per extension instance
    chrome.storage.local.get(["gameId", "isPlayer2"], (data) => {
        if (data.gameId) {
            gameId = data.gameId;
            isPlayer2 = data.isPlayer2;
            console.log("Retrieved game state:", { gameId, isPlayer2 });
        }

        // If Player 2 is waiting, start polling for game status
        if (isPlayer2 && gameId) {
            console.log("Starting polling for game status as Player 2");
            const pollInterval = setInterval(() => {
                fetch(`${BACKEND_API}/api/games/${gameId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(game => {
                        console.log("Game status update:", game);
                        if (game.status === "in_progress") {
                            clearInterval(pollInterval);
                            window.location.href = "game-play-screen.html";
                        }
                    })
                    .catch(err => {
                        console.log("Error polling game status:", err);
                        // Don't clear the interval on error, keep trying
                    });
            }, 1500);
        }
    });

    // Toggle button state
    const toggleButtonState = (button, isEnabled) => {
        if (button) {
            button.disabled = !isEnabled;
            button.style.backgroundColor = isEnabled ? "#eda93a" : "#555";
            button.style.cursor = isEnabled ? "pointer" : "not-allowed";
        }
    };

    // Create Team Flow (Player 1)
    if (createTeamButton) {
        createTeamButton.addEventListener("click", () => {
            // Only clear game-related data, not user data
            chrome.storage.local.get(['user'], (result) => {
                const userData = result.user;
                chrome.storage.local.clear(() => {
                    // Restore user data after clearing
                    if (userData) {
                        chrome.storage.local.set({ user: userData });
                    }
                    window.location.href = "create-team-screen.html";
                });
            });
        });
    }

    if (inviteCodeElement) {
        chrome.storage.local.get(["inviteCode", "user"], (data) => {
            let code = data.inviteCode || generateRandomCode();
            inviteCodeElement.innerText = code;
            chrome.storage.local.set({ inviteCode: code });

            toggleButtonState(startGameButton, false);

            if (!gameId) {
                // Create game on backend with logged-in username
                fetch(`${BACKEND_API}/api/games`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        invitation_code: code, 
                        username: data.user.leetcodeId 
                    })
                })
                .then(response => response.json())
                .then(data => {
                    gameId = data._id;
                    chrome.storage.local.set({ gameId });
                    sendWebSocketMessage({ type: "CREATE_GAME", gameId, invitation_code: code });
                })
                .catch(error => console.log("Error creating game:", error));
            }
        });
    }

    // Copy Code Button
    if (copyCodeButton) {
        copyCodeButton.addEventListener("click", () => {
            chrome.storage.local.get(["inviteCode"], (data) => {
                navigator.clipboard.writeText(data.inviteCode).then(() => {
                    alert("Code copied!");
                });
            });
        });
    }

    // Join Team Flow (Player 2)
    if (joinTeamButton) {
        joinTeamButton.addEventListener("click", () => {
            window.location.href = "join-team-screen.html";
        });
    }

    if (confirmJoinButton) {
        confirmJoinButton.addEventListener("click", () => {
            const codeInput = document.getElementById("teamCodeInput").value.trim();
            
            chrome.storage.local.get(['user'], (result) => {
                if (!result.user || !result.user.loggedIn) {
                    window.location.href = "login-page-screen.html";
                    return;
                }

                console.log("Attempting to join game with code:", codeInput);
                fetch(`${BACKEND_API}/api/games/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        invitation_code: codeInput, 
                        username: result.user.leetcodeId 
                    })
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    console.log("Join game response:", data);
                    if (data.message) {
                        alert(data.message);
                    } else {
                        gameId = data._id;
                        chrome.storage.local.set({ 
                            gameId: data._id, 
                            isPlayer2: true, 
                            player2: result.user.leetcodeId 
                        }, () => {
                            console.log("Game state stored:", { 
                                gameId: data._id, 
                                isPlayer2: true, 
                                player2: result.user.leetcodeId 
                            });

                            // Send join message with Player 2's info
                            sendWebSocketMessage({ 
                                type: "PLAYER_JOINED", 
                                gameId: data._id, 
                                invitation_code: codeInput,
                                player2: result.user.leetcodeId 
                            });

                            // Hide the join form and show the waiting message
                            const joinForm = document.getElementById("teamCodeInput");
                            const joinButton = document.getElementById("confirm-join");
                            if (joinForm) joinForm.style.display = "none";
                            if (joinButton) joinButton.style.display = "none";

                            // Show waiting message
                            const waitingMsg = document.createElement("p");
                            waitingMsg.id = "waitingMsg";
                            waitingMsg.textContent = "Waiting for Player 1 to start the game...";
                            document.getElementById("join-team-screen").appendChild(waitingMsg);
                        });
                    }
                })
                .catch(err => {
                    console.log("Failed to join game:", err);
                    alert("Failed to join game. Please try again.");
                });
            });
        });
    }

    async function getInviteCode() {
        return new Promise((resolve) => {
            chrome.storage.local.get(["inviteCode"], (data) => resolve(data.inviteCode));
        });
    }

    // WebSocket message handler
    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        const inviteCode = await getInviteCode();

        if (data.type === "PLAYER_JOINED") {
            chrome.storage.local.get(["inviteCode", "isPlayer2"], (storage) => {
                if (data.invitation_code === storage.inviteCode) {
                    // If this is Player 1 (creator)
                    if (!storage.isPlayer2) {
                        console.log("Player 2 has joined! Updating UI...");

                        // Update Player 2's name display
                        const player2Name = document.getElementById("player2Name");
                        if (player2Name) {
                            player2Name.textContent = data.player2 || "";
                        }

                        // Hide "Waiting for Player 2..." message
                        const waitingMsg = document.getElementById("waitingMsg");
                        if (waitingMsg) waitingMsg.remove();

                        // Show Player 2 container
                        const player2Container = document.getElementById("player2-container");
                        if (player2Container) {
                            player2Container.style.display = "block";
                        }

                        // Enable start button
                        toggleButtonState(startGameButton, true);
                    }
                    // If this is Player 2 (joiner)
                    else {
                        console.log("Joined game! Updating UI...");
                        
                        // Get Player 1's name from storage
                        chrome.storage.local.get(['user'], (result) => {
                            const player1Name = document.getElementById("player1Name");
                            if (player1Name) {
                                player1Name.textContent = result.user.leetcodeId;
                            }
                        });

                        // Hide the join form and show the waiting message
                        const joinForm = document.getElementById("teamCodeInput");
                        const joinButton = document.getElementById("confirm-join");
                        if (joinForm) joinForm.style.display = "none";
                        if (joinButton) joinButton.style.display = "none";

                        // Show waiting message
                        const waitingMsg = document.createElement("p");
                        waitingMsg.id = "waitingMsg";
                        waitingMsg.textContent = "Waiting for Player 1 to start the game...";
                        document.getElementById("join-team-screen").appendChild(waitingMsg);
                    }
                }
            });
        }
        // Handle START_GAME message
        else if (data.type === "START_GAME") {
            console.log("Received game configuration:", data.config);
            
            // Store the game configuration
            chrome.storage.local.get(['gameState'], (result) => {
                const gameState = result.gameState || {};
                chrome.storage.local.set({
                    gameState: {
                        ...gameState,
                        config: data.config,
                        status: 'in_progress'
                    }
                }, () => {
                    // Stop polling
                    clearInterval(pollInterval);
                    
                    // Navigate to game play screen
                    window.location.href = 'game-play-screen.html';
                });
            });
        }
    };

    // Start Game Button
    if (startGameButton) {
        startGameButton.addEventListener("click", async () => {
            try {
                chrome.storage.local.get(['user', 'player2'], (result) => {
                    const player1Name = result.user.leetcodeId;
                    const player2Name = result.player2;

                    // Store in localStorage
                    localStorage.setItem("Player1", player1Name);
                    localStorage.setItem("Player2", player2Name);

                    // Store game state before navigation
                    chrome.storage.local.set({
                        gameState: {
                            gameId: gameId,
                            player1: player1Name,
                            player2: player2Name,
                            status: "setup"
                        }
                    });

                    // Navigate to setup screen
                    window.location.href = "game-setup-screen.html";
                });
            } catch (err) {
                console.log("Failed to proceed to game setup:", err);
            }
        });
    }

    let game_code_text = document.getElementById("inviteCode");
    if (game_code_text) {
        const gameCode = localStorage.getItem("gameCode");
        game_code_text.innerText = gameCode;
        //then add this game code (with other features like player)
        //to the list of currently available games
    }

    const toggleCheckbox = document.getElementById("toggle-note-checkbox");
    const noteContent = document.getElementById("note-content");

    function adjustNoteHeight() {
        if (toggleCheckbox && noteContent) {
            if (toggleCheckbox.checked) {
                let availableHeight = window.innerHeight - noteContent.offsetTop - 20;
                noteContent.style.height = `${availableHeight}px`;
            } else {
                noteContent.style.height = "0px";
            }
        }
    }

    // Adjust height when checkbox state changes
    if (toggleCheckbox) {
        toggleCheckbox.addEventListener("change", adjustNoteHeight);
    }

    // Update height when the window is resized
    window.addEventListener("resize", adjustNoteHeight);
});