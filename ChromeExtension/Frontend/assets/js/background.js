<<<<<<< Updated upstream
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJxU__PKIHf8C1zYIu1BSboQIWTg8GVuU",
  authDomain: "yeetcode-96453.firebaseapp.com",
  databaseURL: "https://yeetcode-96453-default-rtdb.firebaseio.com",
  projectId: "yeetcode-96453",
  storageBucket: "yeetcode-96453.firebasestorage.app",
  messagingSenderId: "1014512827195",
  appId: "1:1014512827195:web:168246c4cb9e930d40151e"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ✅ Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "storeTeamCode") {
    set(ref(database, "teams/" + request.teamCode), {
      player1: request.playerName
    }).then(() => {
      sendResponse({ status: "Team code stored!" });
    }).catch((error) => {
      sendResponse({ status: "Error: " + error.message });
    });

    return true; // Required for async response
  }
});
=======
chrome.runtime.onInstalled.addListener(() =>  {
    chrome.sidePanel.setOptions({ path: "Frontend/main-screen.html" })
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true});
});

chrome.tabs.onUpdated.addListener((tabId, tab) => {
    console.log("\n\nTesting: BACKGROUND LOGS!!!\n\n")
    console.log("HEY HEY HEY")
    console.log("YES YES YES")
    
    chrome.tabs.sendMessage(tabId, {
        message: "connected"
    })
  })
>>>>>>> Stashed changes
