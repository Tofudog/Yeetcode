import { userRecentSubmission } from "./userRecentSubmission.js";

const SUBMISSION_PARAM = "recentSubmissions";

async function getUserData(user) {
    const recentSubmission = await userRecentSubmission(user, 1)[0];
    if (!(SUBMISSION_PARAM in recentSubmission)) {
        console.log(`${SUBMISSION_PARAM} is not in the user response!`);
        return null;
    }
    return recentSubmission;
}

export default getUserData;