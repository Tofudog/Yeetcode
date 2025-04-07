export const fetchRecentSubmissions = async (username, limit) => {
    const query = `
        query recentSubmissions($username: String!, $limit: Int!) {
          recentSubmissionList(username: $username, limit: $limit) {
            title
            timestamp
            statusDisplay
          }
        }
    `;

    const variables = { username, limit: parseInt(limit) };

    try {
        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        });

        const data = await response.json();
        if (data.data && data.data.recentSubmissionList) {
            let submissionDict = {};
            data.data.recentSubmissionList.forEach((submission, index) => {
                submissionDict[index] = {
                    title: submission.title,
                    timestamp: submission.timestamp, 
                    status: submission.statusDisplay,
                };
            });

            return submissionDict;
        } else {
            throw new Error("Submission details not found or error retrieving data");
        }
    } catch (error) {
        console.error("Error fetching LeetCode submission details:", error);
        throw new Error("Internal server error");
    }
};



export const validateUser = async (username) =>{ 
    username = username.toLowerCase();
    username = username.trim();
    const query = `
      query userPublicProfile($username: String!) {
          matchedUser(username: $username) {
              username
          }
      }
  `;
    try {
      const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
        "Content-Type": "application/json", // we're sending JSON-formatted data here.
        },
      body: JSON.stringify({ query, variables: { username } }),
      });
  
      const data = await response.json();
      var postedUsername = data.data.matchedUser.username;
      postedUsername = postedUsername.toLowerCase(); 
      return postedUsername === username
    } catch(error) {
      console.log(error); 
      return false;
    }
}

export const getLeetCodeProblemInfo = async (titleSlug) => {
    titleSlug = titleSlug.toLowerCase();
    titleSlug = titleSlug.trim()
    
    const query = `
        query getProblemInfo($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                difficulty
                isPaidOnly
            }
        }
    `;

    try{
        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
            "Content-Type": "application/json", // we're sending JSON-formatted data here.
            },
          body: JSON.stringify({ query, variables: { titleSlug } }),
          });

        const data = await response.json();

        var difficulty = data.data.question.difficulty;
        var isPaidOnly = data.data.question.isPaidOnly;
        
        var problemInfo = [difficulty, isPaidOnly];

        return problemInfo
    } catch(error) {
        console.log(error);
        return false; 
    }
}