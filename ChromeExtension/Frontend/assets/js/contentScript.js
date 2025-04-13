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

//Main Exceution Logic

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


//<!-------------Disabling Solution Tab Logic----------------!>

let clickableTabWrapperSolutions = null;
let observerSolutions = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.message === 'game start') {
            observerSolutions = new MutationObserver(() => {
            const solutionsTab = document.getElementById('solutions_tab');
            if (solutionsTab) {
                //finds the nearest ancestor (that matches the CSS selector, essentially jut grabs the nearest parent (or self) that has the class .flexlayout__tab_button)
                clickableTabWrapperSolutions = solutionsTab.closest('.flexlayout__tab_button'); 
        
                if (clickableTabWrapperSolutions) {
                    clickableTabWrapperSolutions.style.pointerEvents = 'none';
                    clickableTabWrapperSolutions.style.opacity = '0.5';
                } else {
                    console.log("Could not find clickable tab wrapper.");
                }
            }
        });
        observerSolutions.observe(document.body, { childList: true, subtree: true });
    }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.message === "game over") {
        clickableTabWrapperSolutions.style.pointerEvents = "auto";
        clickableTabWrapperSolutions.style.opacity = '1.0';
        clickableTabWrapperSolutions = null;
        observerSolutions.disconnect();
    }
})



//<!-------------Disabling Editorial Tab Logic----------------!>

let clickableTabWrapperEditorial = null;
let observerEditorial = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.message === 'game start') {
        observerEditorial = new MutationObserver(() => {
            const editorialTab = document.getElementById('editorial_tab');
            if (editorialTab) {
                //finds the nearest ancestor (that matches the CSS selector, essentially jut grabs the nearest parent (or self) that has the class .flexlayout__tab_button)
                clickableTabWrapperEditorial = editorialTab.closest('.flexlayout__tab_button'); 
        
                if (clickableTabWrapperEditorial) {
                    clickableTabWrapperEditorial.style.pointerEvents = 'none';
                    clickableTabWrapperEditorial.style.opacity = '0.5';
                } else {
                    console.log("Could not find clickable tab wrapper.");
                }
            }
        });
        observerEditorial.observe(document.body, { childList: true, subtree: true });
    }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.message === "game over") {
        clickableTabWrapperEditorial.style.pointerEvents = "auto";
        clickableTabWrapperEditorial.style.opacity = '1.0';
        clickableTabWrapperEditorial = null;
        observerEditorial.disconnect();
    }
})

//<!-------------Disabling Editorial Tab Logic----------------!>

//document.query selectorAll selects all elements in the document that have the class text-body, and returns a NodeList.
//Array.from -> converts NodeList into a JS array, which enables .find()
//.find() goes through each element and returns the first element where the functions returns true.
//el.textContent gets the visible text inside the element. 
//.includes('Discussion') checks if the text cntains the word "Discussion"

let clickableTabWrapperDiscussion = null;
let observerDiscussion = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.message === 'game start') {
        observerDiscussion = new MutationObserver(() => {
            const discussionTab = Array.from(document.querySelectorAll('.text-body'))
                .find(el => el.textContent.includes('Discussion'));
        
            if (discussionTab) {
                clickableTabWrapperDiscussion = discussionTab.closest('.group.cursor-pointer');
        
                if (clickableTabWrapperDiscussion) {
                    clickableTabWrapperDiscussion.style.pointerEvents = 'none';
                    clickableTabWrapperDiscussion.style.opacity = '0.5'; 
                } else {
                    console.log("Could not find clickable tab wrapper for Discussion.");
                }
            }
        });
        
        observerDiscussion.observe(document.body, { childList: true, subtree: true });
    }
})


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.message === "game over") {
        clickableTabWrapperDiscussion.style.pointerEvents = "auto";
        clickableTabWrapperDiscussion.style.opacity = '1.0';
        clickableTabWrapperDiscussion = null;
        observerDiscussion.disconnect();
    }
})