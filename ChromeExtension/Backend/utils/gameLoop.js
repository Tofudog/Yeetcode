import getUserData from "./leetcodeUser.js";

const NUM_USERS = 2;
const PARAMS = ["recentSubmissions"];

// Convert title to slug format
function titleToSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function updateSubmission(player1, player2, problemList) {
    /*
    Input: players 1 and 2 (names)
           problemList: titleSlug of the Leetcode problems

    Returns: the updated submission page
        after every three seconds
    */
    const NUM_PROBLEMS = problemList.length;
    let userList = [player1, player2];
    let userToHash = new Map();  //assign each user a number
    let problemToHash = new Map();  //assign each problem a number
    
    for (var i = 0; i < NUM_USERS; i++) {
        userToHash.set(userList[i], i);
    }
    for (var i = 0; i < NUM_PROBLEMS; i++) {
        problemToHash.set(problemList[i], i);
    }

    // Initialize array with correct size
    var correctSubmissions = Array(NUM_USERS).fill().map(() => Array(NUM_PROBLEMS).fill(false));

    // Get game start time from window object
    const gameStartTime = window.GAME_START_TIME;
    if (!gameStartTime) {
        console.error("Game start time not found!");
        return correctSubmissions;
    }

    console.log("Checking submissions for problems:", problemList);
    console.log("Game started at:", new Date(gameStartTime).toISOString());

    for (var i = 0; i < NUM_USERS; i++) {
        let user = userList[i];
        try {
            const currentUserData = await getUserData(user, PARAMS);
            console.log(`Raw API response for ${user}:`, currentUserData);
            
            let recentSubmissions = currentUserData.get("recentSubmissions");
            console.log(`Recent submissions for ${user}:`, recentSubmissions);
            
            if (recentSubmissions && recentSubmissions.length > 0) {
                // Only check submissions made after game start time
                recentSubmissions.forEach(submission => {
                    console.log(`Checking submission:`, submission);
                    console.log(`Submission title: ${submission.title}`);
                    console.log(`Submission status: ${submission.statusDisplay}`);
                    
                    // Convert submission title to slug format for comparison
                    const submissionSlug = titleToSlug(submission.title);
                    console.log(`Converted submission title to slug: ${submissionSlug}`);
                    console.log(`Is this slug in our problem list? ${problemList.includes(submissionSlug)}`);
                    
                    // Convert Unix timestamp (seconds) to milliseconds
                    const submissionTime = parseInt(submission.timestamp) * 1000;
                    console.log(`Submission time: ${new Date(submissionTime).toISOString()}`);
                    console.log(`Is submission after game start? ${submissionTime >= gameStartTime}`);
                    
                    if (submissionTime >= gameStartTime && 
                        submission.statusDisplay === "Accepted" && 
                        problemList.includes(submissionSlug)) {
                        console.log(`Found valid submission for ${user} on problem ${submissionSlug}`);
                        const userIdx = userToHash.get(user);
                        const problemIdx = problemToHash.get(submissionSlug);
                        correctSubmissions[userIdx][problemIdx] = true;
                    }
                });
            }
        } catch (error) {
            console.error(`Error fetching data for user ${user}:`, error);
        }
    }

    console.log("Final submission status:", correctSubmissions);
    return correctSubmissions;
}

export default updateSubmission;