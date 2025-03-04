/**
 * Validates if a LeetCode username exists.
 * 
 * @param {string} username - The LeetCode username to validate.
 * @returns {Promise<boolean>} - Returns true if the user exists, otherwise false.
 */
const isValid = async (username) => {
    try {
        const url = `https://leetcode-api-faisalshohag.vercel.app/${username}`;
        const response = await fetch(url);
        const data = await response.json();
        
        // Check if the response contains errors
        if (data.errors) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

export default isValid;
