import updateSubmission from "../../../Backend/utils/gameLoop.js";
import innerHtmlStyle from "./innerHtml.js";

const CHECKING_IF_PASSED = true; //Can change this to true if want to check a submission passed
const CYCLE_AMOUNT = 15; //Number of seconds per API Call
let PLAYER1 = ""; //both players will be defined by the user
let PLAYER2 = "";
const PROBLEM_LIST = [
    "two-sum",
    "maximum-candies-allocated-to-k-children",
    "reverse-integer"
];
const NUM_USERS = 2;
const NUM_PROBLEMS = 3;

var currentCorrectSubmissions = [
    [0, 0, 0],
    [0, 0, 0]
];

var numHours = 0;
var numMinutes = 10;
var numSeconds = 0;

const gameOverPage = "assets/yeet_motion_html_files/yeet_motion.html";
const gameOverPage2 = "assets/yeet_motion_html_files/rip_motion.html";

document.addEventListener("DOMContentLoaded", function () {
    const player1Name = localStorage.getItem("Player1");
    const player2Name = localStorage.getItem("Player2");
    PLAYER1 = player1Name;
    PLAYER2 = player2Name;
    document.getElementById("gamePlayer1").innerText = player1Name;
    document.getElementById("gamePlayer2").innerText = player2Name;
});

function getNextTime(hours, minutes, seconds) {
    //precondition: hours, minutes, and/or seconds > 0
    if (seconds === 0) {
        if (minutes === 0) {
            if (hours === 0) {
                return [0, 0, 0]; // 🔥 prevent negative time
            }
            --hours;
            minutes = 59;
        } else {
            --minutes;
        }
        seconds = 59;
    } else {
        --seconds;
    }
    return [hours, minutes, seconds];
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
                if (currentCorrectSubmissions[i][j] !== updatedPlayerSubmissions[i][j]) {
                    //that means circle to check mark (nothing to correct)!
                    const boxElement = `player${i+1}Box${j+1}`;
                    let mark = (updatedPlayerSubmissions[i][j] === 1) ? "✔" : "X";
                    let color = (updatedPlayerSubmissions[i][j] === 1) ? "green" : "red";
                    let checkMarkMap = new Map(); //the styling definition for a check mark
                    checkMarkMap.set("color", color);
                    checkMarkMap.set("font-size", "30px");
                    document.getElementById(boxElement).innerHTML = innerHtmlStyle(mark, null, checkMarkMap);
                    currentCorrectSubmissions[i][j] = updatedPlayerSubmissions[i][j];
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

