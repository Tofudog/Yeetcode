import generateRandomCode from "./code_generator.js";
import { isValidUser } from "./utils.js";

const socket = new WebSocket("ws://localhost:3000/ws");

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

    let gameId;
    let isPlayer2 = false;

    // Fetch game state per extension instance
    chrome.storage.local.get(["gameId", "isPlayer2"], (data) => {
        gameId = data.gameId;
        isPlayer2 = data.isPlayer2;
    });

    // Toggle button state
    const toggleButtonState = (button, isEnabled) => {
        if (button) {
            button.disabled = !isEnabled;
            button.style.backgroundColor = isEnabled ? "#4CAF50" : "#555"; // Green active, dark grey disabled
            button.style.cursor = isEnabled ? "pointer" : "not-allowed";
        }
    };

    // **Create Team Flow (Player 1)**
    if (createTeamButton) {
        createTeamButton.addEventListener("click", () => {
            localStorage.clear()
            chrome.storage.local.clear()
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
                fetch("http://localhost:3000/api/games", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invitation_code: code, username: null })
                })
                .then(response => response.json())
                .then(data => {
                    gameId = data._id;
                    chrome.storage.local.set({ gameId });
                    socket.send(JSON.stringify({ type: "CREATE_GAME", gameId, invitation_code: code }));
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

            fetch("http://localhost:3000/api/games/join", {
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

                    window.location.href = "join-team-lobby.html"; // Player 2 waits
                }
            })
            .catch(err => console.error("Failed to join game:", err));
        });
    }

    // **Listen for WebSocket updates**
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "PLAYER_JOINED") {
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
                        player2Input.value = data.player2;
                        player2Input.disabled = true;
                        player2Container.appendChild(player2Input);
                    }

                    player2Container.style.display = "block"; 
                    toggleButtonState(startGameButton, true); 
                }
            });
        }

        // Notify Player 2 when game starts
        if (data.type === "START_GAME") {
            console.log("Game started! Redirecting to play screen...");
            window.location.href = "game-play-screen.html";
        }
    };

    // **Start Game Button**
    if (startGameButton) {
        startGameButton.addEventListener("click", () => {
            chrome.storage.local.get(["gameId", "inviteCode"], (data) => {
                if (!data.gameId) {
                    console.error("Game ID not found in storage.");
                    return;
                }

                const gameId = data.gameId;
                const player1Name = document.getElementById("player1Name").value.trim();

                if (!player1Name) {
                    alert("Please enter a username before starting the game.");
                    return;
                }

                // Update game on backend with player1Name and set status to "in_progress"
                fetch(`http://localhost:3000/api/games/${gameId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        player_1: player1Name,
                        status: "in_progress"
                    })
                })
                .then(response => response.json())
                .then(updatedGame => {
                    console.log("Game updated successfully:", updatedGame);

                    // Notify both players that game has started
                    socket.send(JSON.stringify({ type: "START_GAME", gameId }));

                    // Redirect both players to game play screen
                    window.location.href = "game-play-screen.html";
                })
                .catch(error => console.error("Failed to update game:", error));
            });
        });
    }

});
