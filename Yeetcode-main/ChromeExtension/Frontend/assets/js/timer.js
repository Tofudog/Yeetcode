var numHours = 0;
var numMinutes = 10;
var numSeconds = 0;

const gameOverPage = "assets/yeet_motion_html_files/yeet_motion.html";

function getNextTime(hours, minutes, seconds) {
    //precondition: hours, minutes, and/or seconds > 0
    if (seconds === 0) {
        if (minutes === 0) {
            --hours;
            seconds = 59;
            minutes = 59;
        }
        else {
            --minutes;
            seconds = 59;
        }
    }
    else {
        --seconds;
    }
    let retTime = [hours, minutes, seconds];
    return retTime;
}

function timeFormated(hours, minutes, seconds) {
    //0 <= hours <= 5; 0 <= minutes, seconds < 60
    var timeOutput = ``;
    if (hours < 10) {timeOutput += `0`;}
    timeOutput += `${hours}:`;
    if (minutes < 10) {timeOutput += `0`;}
    timeOutput += `${minutes}:`;
    if (seconds < 10) {timeOutput += `0`;}
    timeOutput += `${seconds}`;
    return timeOutput;
}

var intervalTimer = setInterval(function() {
    const nextTime = getNextTime(numHours, numMinutes, numSeconds);
    numHours = nextTime[0];
    numMinutes = nextTime[1];
    numSeconds = nextTime[2];
    if (numHours === 0 && numMinutes === 0 && numSeconds === 0) {
        //switch to game over
        window.location.href = gameOverPage;
    }
    else {
        //for later: reformat time
        document.getElementById("timerText").innerText = timeFormated(numHours, numMinutes, numSeconds);
    }
}, 1000);

