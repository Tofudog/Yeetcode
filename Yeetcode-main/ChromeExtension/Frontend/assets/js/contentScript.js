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
