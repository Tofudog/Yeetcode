// Save data to Chrome local storage
function saveSession(data) {
    chrome.storage.local.set(data, () => {
    });
}

function getNextTime(minutes, seconds) {
    //precondition: minutes and/or seconds > 0
    if (seconds === 0) {
        if (minutes === 0) {
            return [0, 0]; // prevent negative time
        }
        --minutes;
        seconds = 59;
    } else {
        --seconds;
    }
    return [minutes, seconds];
}

function timeFormated(minutes, seconds) {
    //0 <= minutes, seconds < 60
    var timeOutput = ``;
    if (minutes < 10) {timeOutput += `0`;}
    timeOutput += `${minutes}:`;
    if (seconds < 10) {timeOutput += `0`;}
    timeOutput += `${seconds}`;
    return timeOutput;
}

function titleToSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export { saveSession, getNextTime, timeFormated, titleToSlug }