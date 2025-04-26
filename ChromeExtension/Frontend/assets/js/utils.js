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

function updateRating(result, ownElo, opponentElo) {
    ownElo = parseInt(ownElo);
    opponentElo = parseInt(opponentElo);

    // Calculate rating difference
    let eloDiff = Math.abs(ownElo - opponentElo);
    // Base rating change is 8 for ratings within 25 points
    let baseChange = 8;
    
    // For every 25 points difference beyond the initial 25, add 1
    if (eloDiff > 25) {
        let additionalPoints = Math.floor((eloDiff - 25) / 25);
        baseChange += additionalPoints;
    }
    
    // Apply win/loss multiplier
    baseChange *= (result === 1 ? 1 : -1);
    // Calculate final rating change
    let ratingChange = Math.round(baseChange);
    
    // Update rating
    ownElo = Math.round(ownElo + ratingChange);
    
    return String(ownElo);
}

export {saveSession, getNextTime, timeFormated, titleToSlug, updateRating};