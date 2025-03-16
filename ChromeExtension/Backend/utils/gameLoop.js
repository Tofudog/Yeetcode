import getUserData from "./leetcodeUser.js";

//we'll make this dynamic later
const NUM_USERS = 2;
const NUM_PROBLEMS = 3;
const PARAMS = ["recentSubmissions"];

async function updateSubmission(player1, player2, problemList) {
    /*
    Input: players 1 and 2 (names)
           problemList: titleSlug of the Leetcode problems

    Returns: the updated submission page
        after every three seconds
    */

    let userList = [player1, player2];
    let userToHash = new Map();  //assign each user a number
    let problemToHash = new Map();  //assign each problem a number
    for (var i=0; i<NUM_USERS; i++) {userToHash.set(userList[i], i);}
    for (var i=0; i<NUM_PROBLEMS; i++) {problemToHash.set(problemList[i], i);}

    //convention of what each number means:
    //0: unattempted; 1: correct; 2: incorrect
    var correctSubmissions = [
        [0, 0, 0],
        [0, 0, 0]
    ];

    for (var i=0; i<NUM_USERS; i++) {
        let user = userList[i];
        const currentUserData = await getUserData(user, PARAMS);
        let recentSubmissions = currentUserData.get("recentSubmissions");
        if (recentSubmissions.length > 0) {
            //edge case: if user has never submitted, this will not work
            let mostRecent = recentSubmissions[0];
            const userIdx = userToHash.get(user);
            const problemIdx = problemToHash.get(mostRecent["titleSlug"]);
            if (mostRecent["statusDisplay"] === "Accepted") {
                if (problemList.includes(mostRecent["titleSlug"])) {
                    correctSubmissions[userIdx][problemIdx] = 1;
                }
            }
            else if (mostRecent["statusDisplay"] === "Run Time Error") {
                //maintain if there's a runtime error, as it's consistent with contest rating
            }
            else {
                //'Wrong Answer' is not the only alternative to 'Accepted'
                if (problemList.includes(mostRecent["titleSlug"])) {
                    correctSubmissions[userIdx][problemIdx] = 2;
                }
            }

        }
    }

    return correctSubmissions;
}

export default updateSubmission;