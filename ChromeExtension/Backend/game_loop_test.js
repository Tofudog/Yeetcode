import updateSubmission from "./game_loop.js";

async function main(player1, player2, problemList) {
    const correctSubmissions = updateSubmission(player1, player2, problemList)
    console.log(correctSubmissions);
}

let myUserList = ["Tofudog25", "asdfghjkl85"];
let myProblemList = [
    "merge-two-2d-arrays-by-summing-values",
    "partition-array-according-to-given-pivot",
    "apply-operations-to-an-array"
];
main(myUserList[0], myUserList[1], myProblemList);