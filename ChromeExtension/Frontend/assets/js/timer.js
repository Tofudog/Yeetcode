import updateSubmission from "./../../../Backend/game_loop.js";

const CHECKING_IF_PASSED = true; //Can change this to true if want to check a submission passed
const CYCLE_AMOUNT = 15; //Number of seconds per API Call
const PLAYER1 = "sun2001128";
const PLAYER2 = "Tofudog25";
const PROBLEM_LIST = [
    "two-sum",
    "big-countries",
    "reverse-integer"
];
const NUM_USERS = 2;
const NUM_PROBLEMS = 3;

var currentCorrectSubmissions = [
    [false, false, false],
    [false, false, false]
];

var numHours = 0;
var numMinutes = 10;
var numSeconds = 0;

const gameOverPage = "assets/yeet_motion_html_files/yeet_motion.html";
const gameOverPage2 = "assets/yeet_motion_html_files/rip_motion.html";

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

var intervalTimer = setInterval(async function() {
    const nextTime = getNextTime(numHours, numMinutes, numSeconds);
    numHours = nextTime[0];
    numMinutes = nextTime[1];
    numSeconds = nextTime[2];
    if (numSeconds % CYCLE_AMOUNT === 0 && CHECKING_IF_PASSED) {
        //then check if submission has changed (this will be inefficient, but for now do this)
        const updatedPlayerSubmissions = await updateSubmission(PLAYER1, PLAYER2, PROBLEM_LIST);
        for (var i=0; i<NUM_USERS; i++) {
            for (var j=0; j<NUM_PROBLEMS; j++) {
                if (currentCorrectSubmissions[i][j]===false && updatedPlayerSubmissions[i][j]===true) {
                    //that means circle to check mark (nothing to correct)!
                    const boxElement = `player${i+1}Box${j+1}`;
                    document.getElementById(boxElement).innerText = "✔️";
                    currentCorrectSubmissions[i][j] = true;
                }
            }
        }
    }
    if (numHours === 0 && numMinutes === 0 && numSeconds === 0) {
        //switch to game over
        window.location.href = gameOverPage;
    }
    else {
        //for later: reformat time
        document.getElementById("timerText").innerText = timeFormated(numHours, numMinutes, numSeconds);
    }
}, 1000);

