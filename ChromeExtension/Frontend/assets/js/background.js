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
                console.log("Received START_GAME signal");
                
                // Store game data in chrome.storage for both players in multiple formats
                const storageData = {
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
                };
                
                // Add game settings if provided
                if (data.gameSettings) {
                    storageData['gameDifficulty'] = data.gameSettings.difficulty;
                    storageData['gameTime'] = data.gameSettings.timeLimit;
                    storageData['gameProblems'] = data.gameSettings.numProblems;
                    storageData['gameProblemList'] = data.gameSettings.problems;
                    
                    // Also add to gameState
                    storageData['gameState']['settings'] = {
                        'difficulty': data.gameSettings.difficulty,
                        'timeLimit': data.gameSettings.timeLimit,
                        'numProblems': data.gameSettings.numProblems,
                        'problems': data.gameSettings.problems
                    };
                }
                
                chrome.storage.local.set(storageData, () => {
                    console.log("Game data and settings stored in chrome.storage in multiple formats");
                    
                    // Find the tab that initiated the game (if sender is available)
                    if (data.sender && data.sender.tabId) {
                        // Update only the tab that initiated the game
                        try {
                            // First check if the tab exists
                            chrome.tabs.get(data.sender.tabId, (tab) => {
                                if (chrome.runtime.lastError) {
                                    console.error("Error getting tab:", chrome.runtime.lastError);
                                    return;
                                }
                                
                                if (!tab) {
                                    console.log("Tab not found, skipping message send");
                                    return;
                                }
                                
                                // Send message to content script with game settings
                                const messageData = { 
                                    type: "START_GAME",
                                    gameId: data.gameId,
                                    player_1: data.player_1,
                                    player_2: data.player_2
                                };
                                
                                // Add game settings if provided
                                if (data.gameSettings) {
                                    messageData.gameSettings = data.gameSettings;
                                }
                                
                                try {
                                    chrome.tabs.sendMessage(data.sender.tabId, messageData, (response) => {
                                        if (chrome.runtime.lastError) {
                                            console.log("Error sending message to tab:", chrome.runtime.lastError);
                                        }
                                    });
                                } catch (error) {
                                    console.error("Error sending message to tab:", error);
                                }
                                
                                // Also update the tab URL directly
                                if (!tab.url || !tab.url.includes("game-play-screen.html")) {
                                    chrome.tabs.update(data.sender.tabId, { 
                                        url: chrome.runtime.getURL("Frontend/game-play-screen.html") 
                                    }, (updatedTab) => {
                                        if (chrome.runtime.lastError) {
                                            console.error("Error updating tab:", chrome.runtime.lastError);
                                        }
                                    });
                                } else {
                                    console.log("Tab is already on game-play-screen.html, skipping URL update");
                                }
                            });
                        } catch (error) {
                            console.error("Error processing tab:", error);
                        }
                    } else {
                        // Fallback: If sender is not available, update all tabs
                        console.log("No sender information available, updating all tabs");
                        chrome.tabs.query({}, (tabs) => {
                            if (chrome.runtime.lastError) {
                                console.error("Error querying tabs:", chrome.runtime.lastError);
                                return;
                            }
                            
                            for (let tab of tabs) {
                                if (!tab || !tab.id) continue;
                                
                                try {
                                    // Send message to content script with game settings
                                    const messageData = { 
                                        type: "START_GAME",
                                        gameId: data.gameId,
                                        player_1: data.player_1,
                                        player_2: data.player_2
                                    };
                                    
                                    // Add game settings if provided
                                    if (data.gameSettings) {
                                        messageData.gameSettings = data.gameSettings;
                                    }
                                    
                                    try {
                                        chrome.tabs.sendMessage(tab.id, messageData, (response) => {
                                            if (chrome.runtime.lastError) {
                                                console.log("Error sending message to tab:", chrome.runtime.lastError);
                                            }
                                        });
                                    } catch (error) {
                                        console.error("Error sending message to tab:", error);
                                    }
                                    
                                    // Also update the tab URL directly
                                    if (!tab.url || !tab.url.includes("game-play-screen.html")) {
                                        chrome.tabs.update(tab.id, { 
                                            url: chrome.runtime.getURL("Frontend/game-play-screen.html") 
                                        }, (updatedTab) => {
                                            if (chrome.runtime.lastError) {
                                                console.error("Error updating tab:", chrome.runtime.lastError);
                                            }
                                        });
                                    } else {
                                        console.log("Tab is already on game-play-screen.html, skipping URL update");
                                    }
                                } catch (error) {
                                    console.error("Error processing tab:", error);
                                }
                            }
                        });
                    }
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
        if (message.type === "NAVIGATE_TO_GAME") {
            // Update the side panel to the game play screen
            chrome.sidePanel.setOptions({ 
                path: "Frontend/game-play-screen.html" 
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error updating side panel:", chrome.runtime.lastError);
                } else {
                    console.log("Side panel updated to game-play-screen.html");
                }
            });
            
            // Also update the tab if it's a content script request
            if (sender.tab && sender.tab.id) {
                chrome.tabs.get(sender.tab.id, (tab) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error getting tab:", chrome.runtime.lastError);
                        return;
                    }
                    
                    // Only update the URL if we're not already on the game-play-screen.html page
                    if (!tab.url || !tab.url.includes("game-play-screen.html")) {
                        chrome.tabs.update(sender.tab.id, { 
                            url: chrome.runtime.getURL("Frontend/game-play-screen.html") 
                        }, (updatedTab) => {
                            if (chrome.runtime.lastError) {
                                console.error("Error updating tab:", chrome.runtime.lastError);
                            }
                        });
                    } else {
                        console.log("Tab is already on game-play-screen.html, skipping URL update");
                    }
                });
            }
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

// Reset all localhost data when extension closes
chrome.runtime.onSuspend.addListener(() => {
    console.log("[Background] Extension is being suspended, cleaning up data");
    
    // Clear all chrome.storage.local data
    chrome.storage.local.clear(() => {
        console.log("[Background] All chrome.storage.local data cleared");
    });
    
    // Clear all chrome.storage.session data
    chrome.storage.session.clear(() => {
        console.log("[Background] All chrome.storage.session data cleared");
    });
    
    // Clear all chrome.storage.sync data
    chrome.storage.sync.clear(() => {
        console.log("[Background] All chrome.storage.sync data cleared");
    });
    
    // Close WebSocket connection if it exists
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("[Background] Closing WebSocket connection");
        socket.close();
    }
    
    // Clear message queue
    messageQueue = [];
    console.log("[Background] Message queue cleared");
    
    // Execute content script to clear localStorage and sessionStorage
    chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError) {
            console.error("Error querying tabs:", chrome.runtime.lastError);
            return;
        }
        
        for (let tab of tabs) {
            if (!tab || !tab.id) continue;
            
            try {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        console.log("[ContentScript] Clearing localStorage and sessionStorage");
                        localStorage.clear();
                        sessionStorage.clear();
                        
                        // Also clear any cookies for localhost
                        document.cookie.split(";").forEach(function(c) { 
                            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                        });
                    }
                }).catch(err => {
                    console.error("Error executing script:", err);
                });
            } catch (error) {
                console.error("Error processing tab:", error);
            }
        }
    });
});

// Also handle extension uninstall to clean up data
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "uninstall") {
        console.log("[Background] Extension is being uninstalled, cleaning up data");
        
        // Clear all chrome.storage.local data
        chrome.storage.local.clear(() => {
            console.log("[Background] All chrome.storage.local data cleared");
        });
        
        // Clear all chrome.storage.session data
        chrome.storage.session.clear(() => {
            console.log("[Background] All chrome.storage.session data cleared");
        });
        
        // Clear all chrome.storage.sync data
        chrome.storage.sync.clear(() => {
            console.log("[Background] All chrome.storage.sync data cleared");
        });
        
        // Close WebSocket connection if it exists
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("[Background] Closing WebSocket connection");
            socket.close();
        }
        
        // Clear message queue
        messageQueue = [];
        console.log("[Background] Message queue cleared");
        
        // Execute content script to clear localStorage and sessionStorage
        chrome.tabs.query({}, (tabs) => {
            if (chrome.runtime.lastError) {
                console.error("Error querying tabs:", chrome.runtime.lastError);
                return;
            }
            
            for (let tab of tabs) {
                if (!tab || !tab.id) continue;
                
                try {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => {
                            console.log("[ContentScript] Clearing localStorage and sessionStorage");
                            localStorage.clear();
                            sessionStorage.clear();
                            
                            // Also clear any cookies for localhost
                            document.cookie.split(";").forEach(function(c) { 
                                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                            });
                        }
                    }).catch(err => {
                        console.error("Error executing script:", err);
                    });
                } catch (error) {
                    console.error("Error processing tab:", error);
                }
            }
        });
    } else if (details.reason === "install" || details.reason === "update") {
        // Initialize side panel for new installations or updates
        chrome.sidePanel.setOptions({ path: "Frontend/login-page-screen.html" });
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
});

// Add a function to manually clear all storage
function clearAllStorage() {
    console.log("[Background] Manually clearing all storage");
    
    // Clear all chrome.storage.local data
    chrome.storage.local.clear(() => {
        console.log("[Background] All chrome.storage.local data cleared");
    });
    
    // Clear all chrome.storage.session data
    chrome.storage.session.clear(() => {
        console.log("[Background] All chrome.storage.session data cleared");
    });
    
    // Clear all chrome.storage.sync data
    chrome.storage.sync.clear(() => {
        console.log("[Background] All chrome.storage.sync data cleared");
    });
    
    // Execute content script to clear localStorage and sessionStorage
    chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError) {
            console.error("Error querying tabs:", chrome.runtime.lastError);
            return;
        }
        
        for (let tab of tabs) {
            if (!tab || !tab.id) continue;
            
            try {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        console.log("[ContentScript] Clearing localStorage and sessionStorage");
                        localStorage.clear();
                        sessionStorage.clear();
                        
                        // Also clear any cookies for localhost
                        document.cookie.split(";").forEach(function(c) { 
                            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                        });
                    }
                }).catch(err => {
                    console.error("Error executing script:", err);
                });
            } catch (error) {
                console.error("Error processing tab:", error);
            }
        }
    });
}

// Listen for messages to clear storage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CLEAR_ALL_STORAGE") {
        clearAllStorage();
        sendResponse({ status: "Storage cleared" });
        return true;
    }
    
    // ... existing message handling code ...
});