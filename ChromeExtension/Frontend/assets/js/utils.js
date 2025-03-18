// Save data to Chrome local storage
export function saveSession(data) {
    chrome.storage.local.set(data, () => {
    });
}

export function isValidUser(username) {
    return true
}