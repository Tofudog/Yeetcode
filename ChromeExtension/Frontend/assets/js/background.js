// const BACKEND_API = "https://yeetcode-1.onrender.com";
// const socket = new WebSocket(BACKEND_API.replace(/^http/, "ws") + "/ws");
const BACKEND_API = "http://localhost:3000";
const socket = new WebSocket("ws://localhost:3000/ws");


socket.onopen = () => {
    console.log("WebSocket connected.");
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "PLAYER_JOINED") {
        chrome.runtime.sendMessage({ type: "UPDATE_PLAYER_2", player2: data.player2, gameId: data.gameId });
    }

    if (data.type === "START_GAME") {
        chrome.tabs.query({}, (tabs) => {
            for (let tab of tabs) {
                chrome.tabs.sendMessage(tab.id, { type: "START_GAME" });
            }
        });
    }
};

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (["CREATE_GAME", "PLAYER_JOINED", "START_GAME"].includes(message.type)) {
        socket.send(JSON.stringify(message));
    }
    sendResponse({ status: "ok" });
});

chrome.runtime.onInstalled.addListener(() =>  {
    chrome.sidePanel.setOptions({ path: "Frontend/login-page-screen.html" })
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true});
});

    //anti cheat functions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
    }
})

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
// })