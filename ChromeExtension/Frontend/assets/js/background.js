chrome.runtime.onInstalled.addListener(() =>  {
    chrome.sidePanel.setOptions({ path: "Frontend/main-screen.html" })
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true});
});

chrome.tabs.onUpdated.addListener((tabId, tab) => {
    console.log("\n\nTesting: BACKGROUND LOGS!!!\n\n")
    chrome.tabs.sendMessage(tabId, {
        message: "connected"
    })
  })

    //anti cheat functions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
    }

    console.log("THIS IS THE TAB URL: " + tab.url)
    if (tab.url && tab.url.includes("https://chatgpt.com/")) {
        chrome.tabs.remove(tabId); 
        console.log("Chatgpt is not allowed while running our extension.")
    }
})
