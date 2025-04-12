const { expect, test } = require('@jest/globals');
import { validateUser } from '../utils/leetcodeGraphQLQueries';

const VALID_USERNAMES = [
    "Tofudog25"
];
const INVALID_USERNAMES = [
    "Tofudog23"
];

async function checkValid(username) {
    //check if a particular username is valid
    const userValid = await validateUser(username);
    let exists = "";
    if (userValid) {
        exists = "Yes";
    }
    else {
        exists = "No";
    }
    let message = `Is ${username} on Leetcode? ${exists}!`;
    console.log(message);
}

for (var i=0; i<VALID_USERNAMES.length; i++) {
    const currentUser = VALID_USERNAMES[i];
    test(`Make sure ${VALID_USERNAMES[i]} is valid`, async () => {
        const validStatus = await validateUser(currentUser);
        expect(validStatus).toBe(true);
    });
}

for (var i=0; i<INVALID_USERNAMES.length; i++) {
    const currentUser = INVALID_USERNAMES[i];
    test(`Make sure ${INVALID_USERNAMES[i]} is NOT valid`, async () => {
        const validStatus = await validateUser(currentUser);
        expect(validStatus).toBe(false);
    });
}
