const URL_TEMPLATE = "https://leetcode-api-faisalshohag.vercel.app";

async function getUserData(user, params) {
    if (!user) {
        throw new Error("Username is required");
    }

    let urlUser = `${URL_TEMPLATE}/${user}/`;
    let userResponse = null;
    
    try {
        console.log(`Fetching data for user: ${user}`);
        let response = await fetch(urlUser);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`User "${user}" not found on LeetCode`);
            }
            throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
        }
        userResponse = await response.json();
        console.log(`Raw API response for ${user}:`, userResponse);
    } catch (error) {
        console.error(`Error fetching data for user ${user}:`, error);
        throw error;
    }

    if (!userResponse) {
        throw new Error(`No data received for user ${user}`);
    }

    const userData = new Map();
    params.forEach(PARAM => {
        if (PARAM in userResponse) {
            userData.set(PARAM, userResponse[PARAM]);
            console.log(`Found ${PARAM} for ${user}:`, userResponse[PARAM]);
        } else {
            console.warn(`Parameter "${PARAM}" not found in response for user ${user}`);
            userData.set(PARAM, []);
        }
    });
    
    return userData;
}

export default getUserData;