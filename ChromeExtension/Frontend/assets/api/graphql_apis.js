export const userRecentSubmissions = async (username, limit) =>{ 
    try{ 
        const payload = { username, limit};

        const response = await fetch("http://localhost:2000/api/userRecentSubmissions", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json', 
            },
            body: JSON.stringify(payload)  
          });

        const data = await response.json();
        return data;
    } catch (error){
        console.error("Error: ", error);
        return {};
    }
};

export const validateUser = async (username) => {
    try {
        const payload = {username};

        const response = await fetch('http://localhost:2000/api/validateUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error: ", error);
        return false; 
    }
}

export const getLeetCodeProblemInfo= async (titleSlug) => {
    try {
        const payload = {titleSlug};

        const response = await fetch('http://localhost:2000/api/leetcodeProblemInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data;
    } catch(error) {
        console.error("Error: ", error);
        return [];
    }
}
