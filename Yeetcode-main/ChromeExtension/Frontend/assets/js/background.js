chrome.tabs.onUpdated.addListener((tabId, tab) => {
    console.log("\n\nTesting: BACKGROUND LOGS!!!\n\n")
    chrome.tabs.sendMessage(tabId, {
        message: "connected"
    })
  })