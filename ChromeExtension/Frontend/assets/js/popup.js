import generateRandomCode from "./code_generator.js";

// const BACKEND_API = "https://yeetcode-1.onrender.com";
// const socket = new WebSocket(BACKEND_API.replace(/^http/, "ws") + "/ws");
const BACKEND_API = "http://localhost:3000";
const socket = new WebSocket("ws://localhost:3000/ws");


// Add connection state tracking
let isSocketConnected = false;

// Add heartbeat interval
let heartbeatInterval;

socket.onopen = () => {
    console.log("WebSocket connected");
    isSocketConnected = true;
    // Send any queued messages
    while (messageQueue.length > 0) {
        const message = messageQueue.shift();
        socket.send(JSON.stringify(message));
    }
    
    // Start heartbeat
    heartbeatInterval = setInterval(() => {
        if (isSocketConnected) {
            socket.send(JSON.stringify({ type: "PING" }));
        }
    }, 30000); // Send ping every 30 seconds
};

socket.onclose = () => {
    console.log("WebSocket disconnected");
    isSocketConnected = false;
    // Clear heartbeat interval
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
};

socket.onerror = (error) => {
    console.log("WebSocket error:", error);
    // Attempt to reconnect after a delay
    setTimeout(() => {
        console.log("Attempting to reconnect WebSocket...");
        socket = new WebSocket(BACKEND_API.replace(/^http/, "ws") + "/ws");
    }, 5000);
};

// Add message queue for when WebSocket is disconnected
let messageQueue = [];

// Helper function to send WebSocket messages
function sendWebSocketMessage(message) {
    if (isSocketConnected) {
        socket.send(JSON.stringify(message));
    } else {
        console.log("WebSocket not connected, adding message to queue:", message);
        messageQueue.push(message);
        // Try to reconnect
        socket = new WebSocket(BACKEND_API.replace(/^http/, "ws") + "/ws");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // UI Elements
    const createTeamButton = document.getElementById("create-team-button");
    const joinTeamButton = document.getElementById("join-team-button");
    const setupGameButton = document.getElementById("setup-game-button");
    const startGameButton = document.getElementById("start-game-button");    
    const inviteCodeElement = document.getElementById("inviteCode");
    const player2Container = document.getElementById("player2-container");
    const confirmJoinButton = document.getElementById("confirm-join");
    const back_to_main_button = document.getElementById("back-to-main-screen");
    const back_to_main_button_from_join = document.getElementById("back-to-main-screen-from-join");

    // Check if user is logged in and display username
    chrome.storage.local.get(['user'], (result) => {
        const user = result.user;
        if (!user || !result.user.username || !result.user.token) {
            window.location.href = "login-page-screen.html";
            return;
        }

        // Display logged-in username for both Player1 and Player2 displays
        const player1NameDisplay = document.getElementById('player1Name');
        const player2NameDisplay = document.getElementById('player2Name');
        
        if (player1NameDisplay) {
            player1NameDisplay.textContent = result.user.username;
        }
        if (player2NameDisplay) {
            player2NameDisplay.textContent = result.user.username;
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
    let gameConfigurations;
    let player_1;
    let player_2;
    let pollInterval; // Move pollInterval to outer scope

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
            const code = generateRandomCode();
            chrome.storage.local.set({ invitation_code: code }, () => {
                chrome.storage.local.get(["user", "invitation_code"], (result) => {
                    const player_1 = result.user.username;
                    chrome.storage.local.set({
                        player_1: player_1,
                        player_2: null
                    }, () => {
                        window.location.href = "create-team-screen.html"; // only redirect *after* everything is saved
                    });
                });
            });
        });
    }
    

    if (inviteCodeElement) {
        console.log("test: global player 1 is: ",player_1)
        toggleButtonState(setupGameButton, false);

        chrome.storage.local.get(["invitation_code", "player_1"], (result) => {
            if (inviteCodeElement && result.invitation_code) {
                inviteCodeElement.innerText = result.invitation_code;
            }

            fetch(`${BACKEND_API}/api/games`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    invitation_code: result.invitation_code, 
                    player_1: result.player_1
                })
            })
            .then(response => response.json())
            .then(data => {
                gameId = data._id;
                chrome.storage.local.set({ gameId: gameId });
                sendWebSocketMessage({ type: "CREATE_GAME", gameId, invitation_code: result.invitation_code, player_1: result.player_1});
            })
            .catch(error => console.log("Error creating game:", error));
        });
    }

    // Join Team Flow (Player 2)
    if (joinTeamButton) {
        joinTeamButton.addEventListener("click", () => {
            chrome.storage.local.get(["user"], (data) => {
                player_2 = data.user.username;
                chrome.storage.local.set({
                    player_1: null,
                    player_2: player_2,
                    isPlayer2: true
                }, () => {
                    // Only redirect *after* storage is fully written
                    window.location.href = "join-team-screen.html";
                });
            });
        });
    }
    

    if (confirmJoinButton) {
        confirmJoinButton.addEventListener("click", () => {
            const codeInput = document.getElementById("teamCodeInput").value.trim();
            chrome.storage.local.set({invitation_code: codeInput})

            chrome.storage.local.get(["user", "invitation_code"], (result) => {
                fetch(`${BACKEND_API}/api/games/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        invitation_code: result.invitation_code, 
                        player_2: result.user.username
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
                        player_1 = data.player_1
                        chrome.storage.local.set({ 
                            gameId,
                            player_1
                        }, () => {
                            // Send join message with Player 2's info
                            sendWebSocketMessage({ 
                                type: "PLAYER_JOINED", 
                                gameId: data._id, 
                                invitation_code: result.invitation_code,
                                player_2: result.user.username 
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
    
    // chrome.storage.local.get(["gameId", "isPlayer2"], (data) => {
    //     if (data.gameId && data.isPlayer2) {
    //         gameId = data.gameId;
    //         player_2 = data.isPlayer2;
    //         console.log("Retrieved game state:", { gameId, player_2 });
    
    //         const pollInterval = setInterval(() => {
    //             console.log("Polling game status...");
    
    //             fetch(`${BACKEND_API}/api/games/${gameId}`, {
    //                 method: "GET",
    //                 headers: { "Content-Type": "application/json" }
    //             })
    //             .then(response => {
    //                 if (!response.ok) {
    //                     throw new Error(`HTTP error! status: ${response.status}`);
    //                 }
    //                 return response.json();
    //             })
    //             .then(game => {
    //                 console.log("Poll response - Game status:", game.status);
    //                 if (game.status === "in_progress") {
    //                     clearInterval(pollInterval); // Stop polling
    //                     chrome.storage.local.set({ game_obj: game }, () => {
    //                         window.location.href = "game-play-screen.html";
    //                     });
    //                 }
    //             })
    //             .catch(err => {
    //                 console.log("Error polling game status:", err);
    //                 // optionally: retry again
    //             });
    
    //         }, 1500); // every 1.5 seconds
    //     }
    // });    


    // WebSocket message handler
    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
    
        const myInviteCode = await new Promise(resolve => {
            chrome.storage.local.get(["invitation_code"], res => resolve(res.invitation_code));
        });
    
        if (data.invitation_code !== myInviteCode) {
            console.log("Ignored message not for this game:", data);
            return; // Ignore updates for other games
        }
    
        if (data.type === "PLAYER_JOINED") {
            chrome.storage.local.get(["player_2"], (res) => {
                if (!res.player_2) {
                    // Player 1 UI update
                    console.log(`Player 2, ${data.player_2} has joined! Updating UI...`);
                    const player2Name = document.getElementById("player2Name");
                    if (player2Name) player2Name.textContent = data.player_2;
                    chrome.storage.local.set({player_2: data.player_2})
    
                    const container = document.getElementById("player2-container");
                    if (container) container.style.display = "block";
    
                    toggleButtonState(setupGameButton, true);
                }
            });
        }
    
        if (data.type === "START_GAME") {
            console.log("Received START_GAME signal");
    
            fetch(`${BACKEND_API}/api/games/${data.gameId}`)
                .then(response => response.json())
                .then(game => {
                    // TODO: save game config to local storage
    
                    chrome.storage.local.set({
                        gameState: {
                            gameId: data.gameId,
                            config: game.config,
                            status: 'in_progress'
                        }
                    }, () => {
                        window.location.href = 'game-play-screen.html';
                    });
                })
                .catch(err => {
                    console.log("Error fetching game config:", err);
                });
        }
    };    

    // Setup Game Button
    if (setupGameButton) {
        setupGameButton.addEventListener("click", async () => {
            // Navigate Player 1 to setup
            window.location.href = "game-setup-screen.html";
        });        
    } 

    // Start Game Button
    if (startGameButton) {
        startGameButton.addEventListener("click", async () => {
            chrome.storage.local.get(['user', 'player_2', 'gameId', 'invitation_code'], (result) => {
                const player1Name = result.user.username;
                const player2Name = result.player_2;
                const gameId = result.gameId;
                const invitation_code = result.invitation_code;
        
                // Notify Player 2 that game has started
                sendWebSocketMessage({
                    type: "START_GAME",
                    gameId,
                    invitation_code,
                    player_1: player1Name,
                    player_2: player2Name,
                    sender: {
                        tabId: chrome.runtime.id
                    }
                });
        
                // Request navigation to game play screen
                chrome.runtime.sendMessage({
                    type: "NAVIGATE_TO_GAME"
                }, (response) => {
                    console.log("[Popup] Navigation response:", response);
                    
                    if (chrome.runtime.lastError) {
                        console.error("[Popup] Error navigating to game screen:", chrome.runtime.lastError);
                        // Fallback to direct navigation only if necessary
                        if (!window.location.href.includes("game-play-screen.html")) {
                            window.location.href = "game-play-screen.html";
                        }
                    }
                });
            });
        });        
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