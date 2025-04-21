// Listen for messages from popup.js
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (["CREATE_GAME", "PLAYER_JOINED", "START_GAME"].includes(message.type)) {
//         socket.send(JSON.stringify(message));
//     }
//     sendResponse({ status: "ok" });
// });

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


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === 'updateUI_send_1')
    chrome.runtime.sendMessage({action: "updateUI_send_1_rebound"})
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === 'updateUI_send_1_rebound_2')
    chrome.runtime.sendMessage({action: "updateUI_send_1_rebound_3"})
})


//SENDING UI UPDATES TO PLAYER @
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === 'updateUI_send_2')
    chrome.runtime.sendMessage({action: "updateUI_send_2_rebound"})
})


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if(request.action === 'updateUI_send_2_rebound_2')
//     chrome.runtime.sendMessage({action: "updateUI_send_2_rebound_3"})
// })

//     console.log("THIS IS THE TAB URL: " + tab.url)
//     if (tab.url && tab.url.includes("https://chatgpt.com/")) {
//         chrome.tabs.remove(tabId); 
//         console.log("Chatgpt is not allowed while running our extension.")
//     }
// })