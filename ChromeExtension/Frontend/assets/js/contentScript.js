(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if(type === "NEW") {
            contentScripts();
        }
    });

    const contentScripts = () => {
        console.log("\n\nLOADING CONTENT SCRIPTS!!\n\n")
        
    }
    
    contentScripts();
    
}) ();

//<!------------Submit button logic-----------------!>

console.log("Yeetcode Content Script: Initializing...");

const SUBMIT_BUTTON = 'button[data-e2e-locator="console-submit-button"]';
let submitButtonListenerAttached = false; 

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

    console.log("Initial button search failed. Using mutation observer...");

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


//<!-------------Disabling & Enabling Solution Tab Logic----------------!>
const observer = new MutationObserver(() => {
    const solutionsTab = document.getElementById('solutions_tab');

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (!solutionsTab) return;

        const clickableTabWrapper = solutionsTab.closest('.flexlayout__tab_button');

        if (!clickableTabWrapper) {
            console.log("Clickable tab wrapepr is not found.");
            return;
        }

        if (request.action === "disable_solution_tab") {
            clickableTabWrapper.style.pointerEvents = 'none';
            clickableTabWrapper.style.opacity = '0.5';
            observer.disconnect();
        }

        if (request.action === "enable_solution_tab") {
            clickableTabWrapper.style.pointerEvents = 'auto';
            clickableTabWrapper.style.opacity = '1';
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });