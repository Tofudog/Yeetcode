const URL_TEMPLATE = "https://leetcode-api-faisalshohag.vercel.app";

async function getUserData(user, params) {
    let urlUser = `${URL_TEMPLATE}/${user}/`;
    let userResponse = null;
    let response = await fetch(urlUser);
    if (response.ok) {
        userResponse = await response.json();
    }
    else {
        throw new Error(`This network was not found: ${URL_TEMPLATE}`);
    }

    const userData = new Map();
    params.forEach(PARAM => {
        if (PARAM in userResponse) {
            userData.set(PARAM, userResponse[PARAM]);
        }
        else {
            console.log(`${PARAM} is not in the user response!`);
        }
    });
    
    return userData;
}

export default getUserData;