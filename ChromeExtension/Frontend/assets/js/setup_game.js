// Remove the WebSocket connection and use the background script instead
document.addEventListener("DOMContentLoaded", () => {
    console.log("Setup game page loaded");
    
    const startGameButton = document.getElementById("start-game-button");
    console.log("Start game button found:", !!startGameButton);

    if (startGameButton) {
        startGameButton.addEventListener("click", () => {
            console.log("Start game button clicked");
            
            // Get game data from storage
            chrome.storage.local.get(['user', 'player_2', 'gameId', 'invitation_code'], (result) => {
                console.log("Retrieved game data from storage:", result);
                
                if (!result.user || !result.user.username) {
                    console.error("User data not found in storage");
                    alert("Error: User data not found. Please try logging in again.");
                    return;
                }
                
                if (!result.gameId) {
                    console.error("Game ID not found in storage");
                    alert("Error: Game ID not found. Please create a new game.");
                    return;
                }
                
                const player1Name = result.user.username;
                const player2Name = result.player_2 || "Waiting for player...";
                const gameId = result.gameId;
                const invitation_code = result.invitation_code;
                
                console.log("Game data:", { player1Name, player2Name, gameId, invitation_code });

                // Send message to background script to start the game
                chrome.runtime.sendMessage({
                    type: "START_GAME",
                    gameId,
                    invitation_code,
                    player_1: player1Name,
                    player_2: player2Name
                }, (response) => {
                    console.log("Response from background script:", response);
                    
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message to background script:", chrome.runtime.lastError);
                        alert("Error starting game. Please try again.");
                        return;
                    }
                    
                    // Request navigation to game play screen
                    chrome.runtime.sendMessage({
                        type: "NAVIGATE_TO_GAME"
                    }, (navResponse) => {
                        console.log("Navigation response:", navResponse);
                        
                        if (chrome.runtime.lastError) {
                            console.error("Error navigating to game screen:", chrome.runtime.lastError);
                            // Fallback to direct navigation
                            window.location.href = "game-play-screen.html";
                        }
                    });
                });
            });
        });
    } else {
        console.error("Start game button not found");
    }
});
