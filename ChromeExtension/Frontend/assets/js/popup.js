import { BACKEND_API } from "./config.js";
import generateRandomCode from "./code_generator.js";

const socket = new WebSocket(BACKEND_API.replace(/^http/, "ws") + "/ws");
function waitForSocketConnection(socket, callback) {
    const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
            clearInterval(interval);
            callback();
        }
    }, 50);
}

document.addEventListener("DOMContentLoaded", function () {
    // UI Elements
    const createTeamButton = document.getElementById("create-team-button");
    const joinTeamButton = document.getElementById("join-team-button");
    const startGameButton = document.getElementById("start-game-button");
    const copyCodeButton = document.getElementById("copyCode");
    const inviteCodeElement = document.getElementById("inviteCode");
    let player1Input = document.getElementById("player1Name");
    const player2Container = document.getElementById("player2-container");
    let player2Input = document.getElementById("player2Name");
    const confirmJoinButton = document.getElementById("confirm-join");
    let back_to_main_button = document.getElementById("back-to-main-screen");
    let back_to_main_button_from_join = document.getElementById("back-to-main-screen-from-join");
    const toggleCheckbox = document.getElementById("toggle-note-checkbox");
    const noteContent = document.getElementById("note-content");

    // Navigate back to main screen
    if (back_to_main_button) {
        back_to_main_button.addEventListener("click", function () {
            window.location.href = "main-screen.html";
        });
    }

    // Navigate back to main screen
    if (back_to_main_button_from_join) {
        back_to_main_button_from_join.addEventListener("click", function () {
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
        } else {
            console.error("Game ID not found in storage.");
        }

        // If Player 2 is waiting, start polling for game status
        if (isPlayer2 && gameId) {
            console.log("Polling for game status...");
            if (!gameId) {
                console.error("Game ID is missing.");
                return;
            }            
            const pollInterval = setInterval(() => {
                fetch(`${BACKEND_API}/api/games/${gameId}`)
                    .then(response => response.json())
                    .then(game => {
                        console.log("Game Status:", game.status);
                        if (game.status === "in_progress") {
                            clearInterval(pollInterval);
                            console.log("Game started! Redirecting Player 2...");
                            window.location.href = "game-play-screen.html";
                        }
                    })
                    .catch(err => console.error("Error polling game status:", err));
            }, 1500);
        }
    });

    // Toggle button state
    const toggleButtonState = (button, isEnabled) => {
        if (button) {
            button.disabled = !isEnabled;
            button.style.backgroundColor = isEnabled ? "#eda93a" : "#555"; // Green active, dark grey disabled
            button.style.cursor = isEnabled ? "pointer" : "not-allowed";
        }
    };

    // **Create Team Flow (Player 1)**
    if (createTeamButton) {
        createTeamButton.addEventListener("click", () => {
            localStorage.clear();
            chrome.storage.local.clear();
            window.location.href = "create-team-screen.html";
        });
    }

    if (inviteCodeElement) {
        chrome.storage.local.get(["inviteCode"], (data) => {
            let code = data.inviteCode || generateRandomCode();
            inviteCodeElement.innerText = code;
            chrome.storage.local.set({ inviteCode: code });

            toggleButtonState(startGameButton, false);

            if (!gameId) {
                // Create game on backend
                fetch(`${BACKEND_API}/api/games`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invitation_code: code, username: null })
                })
                .then(response => response.json())
                .then(data => {
                    gameId = data._id;
                    chrome.storage.local.set({ gameId });
                    waitForSocketConnection(socket, () => {
                        socket.send(JSON.stringify({ type: "CREATE_GAME", gameId, invitation_code: code }));
                    });
                    
                })
                .catch(error => console.error("Error creating game:", error));
            }
        });
    }

    // **Copy Code Button**
    if (copyCodeButton) {
        copyCodeButton.addEventListener("click", () => {
            chrome.storage.local.get(["inviteCode"], (data) => {
                navigator.clipboard.writeText(data.inviteCode).then(() => {
                    alert("Code copied!");
                });
            });
        });
    }

    // **Join Team Flow (Player 2)**
    if (joinTeamButton) {
        joinTeamButton.addEventListener("click", () => {
            window.location.href = "join-team-screen.html";
        });
    }

    if (confirmJoinButton) {
        confirmJoinButton.addEventListener("click", () => {
            const codeInput = document.getElementById("teamCodeInput").value.trim();
            const player2Name = document.getElementById("player2Name").value.trim();

            fetch(`${BACKEND_API}/api/games/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invitation_code: codeInput, username: player2Name })
            })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                } else {
                    chrome.storage.local.set({ gameId: data._id, isPlayer2: true, player2: player2Name });

                    socket.send(JSON.stringify({ 
                        type: "PLAYER_JOINED", 
                        gameId: data._id, 
                        invitation_code: codeInput,
                        player2: player2Name 
                    }));

                    console.log("Player 2 joined, polling for game start...");
                }
            })
            .catch(err => console.error("Failed to join game:", err));
        });
    }

    async function getInviteCode() {
        return new Promise((resolve) => {
            chrome.storage.local.get(["inviteCode"], (data) => resolve(data.inviteCode));
        });
    }

    // **Listen for WebSocket updates**
    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        const inviteCode = await getInviteCode();

        if (data.type === "PLAYER_JOINED" && data.invitation_code === inviteCode) {
            chrome.storage.local.get(["inviteCode"], (storage) => {
                if (data.invitation_code === storage.inviteCode) {
                    console.log("Player 2 has joined! Updating UI...");

                if (!player2Container) {
                    player2Container = document.createElement("div");
                    player2Container.id = "player2-container";
                    document.getElementById("create-team-screen").appendChild(player2Container);
                }

                if (!player2Input) {
                    player2Input = document.createElement("input");
                    player2Input.id = "player2Name";
                    player2Input.placeholder = "Player 2"; // Default placeholder
                    player2Container.appendChild(player2Input);
                }

                // Update Player 2's name properly
                player2Input.value = data.player2 || "";
                player2Input.disabled = true; // Ensure Player 1 can't edit Player 2's name

                // Hide "Waiting for Player 2..." message
                const waitingMsg = document.getElementById("waitingMsg");
                if (waitingMsg) waitingMsg.remove();

                player2Container.style.display = "block"; 
                toggleButtonState(startGameButton, true);

                }
            });
        }

        // Notify Player 2 when game starts
        if (data.type === "START_GAME") {
            console.log("Game started! Redirecting Player 2...");
            window.location.href = "game-play-screen.html";
        }
    };

    // **Start Game Button**
    if (startGameButton) {
        startGameButton.addEventListener("click", async () => {
            try {
                // Retrieve player names
                const player1Name = player1Input.value.trim();
                const player2Name = player2Input.value.trim();

                // Store in localStorage
                localStorage.setItem("Player1", player1Name);
                localStorage.setItem("Player2", player2Name);

                // Validate players asynchronously
                let [validPlayer1, validPlayer2] = await Promise.all([true, true]);

                if (validPlayer1 && validPlayer2) {
                    // Update game status on the backend
                    await fetch(`${BACKEND_API}/api/games/${gameId}/status`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "in_progress", player_1: player1Name })
                    });

                    // Notify other players via WebSocket
                    socket.send(JSON.stringify({ type: "START_GAME", gameId }));

                    // Navigate to the gameplay screen
                    window.location.href = "game-play-screen.html";
                } else {
                    // Handle invalid players
                    console.log(`Is ${player1Name} a valid Leetcode user? ${validPlayer1}`);
                    console.log(`Is ${player2Name} a valid Leetcode user? ${validPlayer2}`);

                    if (!validPlayer1) {
                        player1Input.value = `${player1Name} is not a Leetcode username. YEET!`;
                    }
                    if (!validPlayer2) {
                        player2Input.value = `${player2Name} is not a Leetcode username. YEET!`;
                    }
                }
            } catch (err) {
                console.error("Failed to start game:", err);
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

    function adjustNoteHeight() {
        if (toggleCheckbox.checked) {
            let availableHeight = window.innerHeight - noteContent.offsetTop - 20; // Calculate available height in the side panel
            noteContent.style.height = `${availableHeight}px`;
        } else {
            noteContent.style.height = "0px";
        }
    }

    if(toggleCheckbox){
        // Adjust height when checkbox state changes
        toggleCheckbox.addEventListener("change", adjustNoteHeight);
    }

    // Update height when the window is resized
    window.addEventListener("resize", adjustNoteHeight);
});
