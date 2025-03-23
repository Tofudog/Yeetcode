const username = "Tofudog25";
const limit = 2; 

export async function userRecentSubmission(username, limit) {
  try {
      const response = await fetch('/api/recentSubmissions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, limit }),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let recentSubmissionsArray = []

      if (data.data && Array.isArray(data.data.recentSubmissionList)) {
          recentSubmissionsArray = data.data.recentSubmissionList.map((submission) => ({
              title: submission.title,
              titleSlug: submission.titleSlug,
              timestamp: submission.timestamp,
              stauts: submission.status, 
              id: submission.id,
          }));
        return recentSubmissionsArray;
      } 
  } catch(error) {
    console.log(error)
    return [];
  }
}

console.log("THIS IS FROM THE JS FILE", await userRecentSubmission(username, limit));
