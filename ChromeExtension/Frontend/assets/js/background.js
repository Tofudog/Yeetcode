const BACKEND_API = "http://localhost:3000";
let socket = null;
let isSocketConnected = false;
let messageQueue = [];

// Initialize WebSocket connection
function initWebSocket() {
    socket = new WebSocket("ws://localhost:3000/ws");

    socket.onopen = () => {
        console.log("WebSocket connected.");
        isSocketConnected = true;
        
        // Send any queued messages
        while (messageQueue.length > 0) {
            const message = messageQueue.shift();
            socket.send(JSON.stringify(message));
        }
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected.");
        isSocketConnected = false;
        
        // Try to reconnect after a delay
        setTimeout(initWebSocket, 3000);
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log("Received WebSocket message:", data);

            if (data.type === "PLAYER_JOINED") {
                chrome.runtime.sendMessage({ type: "UPDATE_PLAYER_2", player2: data.player_2, gameId: data.gameId });
            }

            if (data.type === "START_GAME") {
                console.log("Received START_GAME message:", data);
                
                // Store game data in chrome.storage for both players in multiple formats
                chrome.storage.local.set({
                    // Format 1: As direct properties
                    'gameStarted': true,
                    'gameId': data.gameId,
                    'player_1': data.player_1,
                    'player_2': data.player_2,
                    
                    // Format 2: As gameState object
                    'gameState': {
                        'gameId': data.gameId,
                        'player_1': data.player_1,
                        'player_2': data.player_2,
                        'status': 'in_progress'
                    }
                }, () => {
                    console.log("Game data stored in chrome.storage in multiple formats");
                    
                    // Redirect all tabs to game-play-screen.html
                    chrome.tabs.query({}, (tabs) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error querying tabs:", chrome.runtime.lastError);
                            return;
                        }
                        
                        for (let tab of tabs) {
                            if (!tab || !tab.id) continue;
                            
                            try {
                                // Send message to content script
                                chrome.tabs.sendMessage(tab.id, { 
                                    type: "START_GAME",
                                    gameId: data.gameId,
                                    player_1: data.player_1,
                                    player_2: data.player_2
                                }, (response) => {
                                    if (chrome.runtime.lastError) {
                                        console.log("Error sending message to tab:", chrome.runtime.lastError);
                                    }
                                });
                                
                                // Also update the tab URL directly
                                chrome.tabs.update(tab.id, { 
                                    url: chrome.runtime.getURL("Frontend/game-play-screen.html") 
                                }, (updatedTab) => {
                                    if (chrome.runtime.lastError) {
                                        console.error("Error updating tab:", chrome.runtime.lastError);
                                    }
                                });
                            } catch (error) {
                                console.error("Error processing tab:", error);
                            }
                        }
                    });
                });
            }
        } catch (error) {
            console.error("Error processing WebSocket message:", error);
        }
    };
}

// Initialize WebSocket when extension starts
initWebSocket();

// Helper function to safely send WebSocket messages
function sendWebSocketMessage(message) {
    if (isSocketConnected && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.log("WebSocket not connected, queueing message");
        messageQueue.push(message);
    }
}

// Listen for messages from popup.js or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message in background.js:", message);
    
    try {
        if (["CREATE_GAME", "PLAYER_JOINED", "START_GAME"].includes(message.type)) {
            sendWebSocketMessage(message);
        }
        
        // Handle direct navigation requests
        if (message.type === "NAVIGATE_TO_GAME" && sender.tab && sender.tab.id) {
            chrome.tabs.update(sender.tab.id, { 
                url: chrome.runtime.getURL("Frontend/game-play-screen.html") 
            }, (updatedTab) => {
                if (chrome.runtime.lastError) {
                    console.error("Error updating tab:", chrome.runtime.lastError);
                }
            });
        }
        
        // Always send a response to prevent the "message port closed" error
        sendResponse({ status: "ok" });
    } catch (error) {
        console.error("Error handling message:", error);
        sendResponse({ status: "error", message: error.message });
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
});

chrome.runtime.onInstalled.addListener(() =>  {
    chrome.sidePanel.setOptions({ path: "Frontend/login-page-screen.html" })
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true});
});

//anti cheat functions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        return;
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === "leetcodesubmitclicked") {
        setTimeout(() => {
            chrome.runtime.sendMessage({action: "triggerUserSubmissionAPICall"});
        }, 5000);
    }
})

//     console.log("THIS IS THE TAB URL: " + tab.url)
//     if (tab.url && tab.url.includes("https://chatgpt.com/")) {
//         chrome.tabs.remove(tabId); 
//         console.log("Chatgpt is not allowed while running our extension.")
//     }