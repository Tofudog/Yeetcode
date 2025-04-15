//<!------------Submit button logic-----------------!>
 
console.log("Yeetcode Content Script: Initializing...");
 
const SUBMIT_BUTTON = 'button[data-e2e-locator="console-submit-button"]';
let submitButtonListenerAttached = false; // Flag to prevent attaching multiple listeners

function findSubmitButtonAndAddListener() {
    if (submitButtonListenerAttached) {
        console.log("Yeetcode Content Script: Listener already attached.");
        return true; 
    }

    const submitButton = document.querySelector(SUBMIT_BUTTON);

    if (submitButton) {
        console.log("Yeetcode Content Script: Submit button FOUND!");
        submitButton.addEventListener('click', handleSubmitClick);
        submitButtonListenerAttached = true; 
        console.log("Yeetcode Content Script: Click listener ATTACHED to submit button.");
        return true;
    } else {
        console.log("Yeetcode Content Script: Submit button NOT FOUND yet using selector:", SUBMIT_BUTTON_SELECTOR);
        return false; 
    }
}

function handleSubmitClick() {
    console.log('Yeetcode Content Script: Submit button CLICKED!');
    // This sends a message to the popup.js script
    chrome.runtime.sendMessage({action: "leetcodesubmitclicked", message: "Submit button clicked"});

}

// --- Main Execution Logic ---

//Try to find the button immediately when loading the page. 
console.log("Yeetcode Content Script: Attempting initial button search...");
if (!findSubmitButtonAndAddListener()) {

    console.log("Yeetcode Content Script: Initial search failed. Setting up MutationObserver...");

    //mutation observer watches for chagnes in the DOM and executes a callback function whenevr a change is detected. 
    //mutationList contains details about what has changed, and obs is the observer itself (used to stop when no longe needed)
    const observer = new MutationObserver((mutationsList, obs) => {
        if (submitButtonListenerAttached) {

            console.log("Yeetcode Content Script: Observer fired, but button already found. Disconnecting.");
            obs.disconnect();
            return;
        }

        console.log("Yeetcode Content Script: DOM Mutation Detected! Re-checking for submit button...");
        //checks if at least ONE item in an array meets a condtition (mutationList.some())
        const foundInMutation = mutationsList.some(mutation => {
            // Check added nodes directly, or just re-run the main query function
            // Re-running the query is simpler and often effective enough
            return findSubmitButtonAndAddListener();
        });

        if (foundInMutation) {
            console.log("Yeetcode Content Script: Submit button found via MutationObserver. Disconnecting observer.");
            obs.disconnect(); 
        } else {
            console.log("Yeetcode Content Script: Observer fired, button still not found.");
        }
    });

    //observer.observe takes in two arguments: (targetNode, options);
    observer.observe(document.body, {
        childList: true, 
        subtree: true   
    });

    console.log("Yeetcode Content Script: MutationObserver is now active.");

} else {
    console.log("Yeetcode Content Script: Button found immediately on load.");
}
console.log("[ContentScript] Content script loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("[ContentScript] Received message:", msg);
    
    if (msg.type === "START_GAME") {
        console.log("[ContentScript] Received START_GAME message", msg);

        try {
            // Prepare storage data
            const storageData = {
                // Format 1: As gameState object
                gameState: {
                    gameId: msg.gameId,
                    player_1: msg.player_1,
                    player_2: msg.player_2,
                    status: "in_progress"
                },
                // Format 2: As direct properties
                player_1: msg.player_1,
                player_2: msg.player_2,
                gameId: msg.gameId,
                gameStarted: true
            };
            
            // Add game settings if provided
            if (msg.gameSettings) {
                storageData.gameDifficulty = msg.gameSettings.difficulty;
                storageData.gameTime = msg.gameSettings.timeLimit;
                storageData.gameProblems = msg.gameSettings.numProblems;
                storageData.gameProblemList = msg.gameSettings.problems;
                
                // Also add to gameState
                storageData.gameState.settings = {
                    difficulty: msg.gameSettings.difficulty,
                    timeLimit: msg.gameSettings.timeLimit,
                    numProblems: msg.gameSettings.numProblems,
                    problems: msg.gameSettings.problems
                };
            }
            
            // Store game data in multiple formats for better compatibility
            chrome.storage.local.set(storageData, () => {
                console.log("[ContentScript] Game data and settings stored in multiple formats");
                
                // Also store in localStorage for immediate access
                localStorage.setItem("Player1", msg.player_1);
                localStorage.setItem("Player2", msg.player_2);
                
                if (msg.gameSettings) {
                    localStorage.setItem("gameDifficulty", msg.gameSettings.difficulty);
                    localStorage.setItem("gameTime", msg.gameSettings.timeLimit);
                    localStorage.setItem("gameProblems", msg.gameSettings.numProblems);
                    localStorage.setItem("gameProblemList", JSON.stringify(msg.gameSettings.problems));
                }
                
                console.log("[ContentScript] Game data stored in localStorage");
                
                // Request navigation to game play screen
                chrome.runtime.sendMessage({
                    type: "NAVIGATE_TO_GAME"
                }, (response) => {
                    console.log("[ContentScript] Navigation response:", response);
                    
                    if (chrome.runtime.lastError) {
                        console.error("[ContentScript] Error navigating to game screen:", chrome.runtime.lastError);
                        // Fallback to direct navigation only if necessary
                        if (!window.location.href.includes("game-play-screen.html")) {
                            window.location.href = "game-play-screen.html";
                        }
                    }
                });
            });
            
            // Send response back to background script
            sendResponse({ status: "redirecting" });
        } catch (error) {
            console.error("[ContentScript] Error handling START_GAME message:", error);
            sendResponse({ status: "error", message: error.message });
        }
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
});
