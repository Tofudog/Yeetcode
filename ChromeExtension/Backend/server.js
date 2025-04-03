import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import gameRoutes from './routes/gameRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { fetchRecentSubmissions } from './utils/leetcodeGraphQLQueries.js';
import { validateUser } from './utils/leetcodeGraphQLQueries.js';
import { deleteAllUsers } from './controllers/userController.js';

const app = express();
app.get("/", (_, res) => res.json({ message: "Welcome to Yeetcode API" }));

// Port
const port = process.env.PORT || 2000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();
// Routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/invitationCodes', invitationRoutes);

//<!--------------------GraphQL Queries---------------------!>

/**
 * Query for user's recent submissions.
 * 
 * @return A dictionary of submisisons arrays.
 *  
 * submissionDict[index] has three fields: title, timestamp, and stauts.
 * submissionDict starts at index 0, submissionDict[0].title will get the title for the user's (most recent) submission.
 *
 */
app.post('/api/userRecentSubmissions', async (req, res) => {
  const { username, limit } = req.body
  if (!username || !limit) {
      return res.status(400).json({ error: "username and limit is required3" });
  }

  try {
    const submissionDict = await fetchRecentSubmissions(username, limit); 
    return res.json(submissionDict);
  } catch (error) {
      console.error("Error fetching LeetCode submission details:", error);
      res.status(500).json({ error: "Internal server error" });
      return {};
  }
});

/**
 * Query for validating a username
 * 
 * @return A boolean if the username exists on leetcode. True if it does, false otherwise. 
 */

app.post('/api/validateUser', async (req, res) => {
  const { username } = req.body;

  if(!username){ 
    return res.status(400).json({ error: "username is required"});
  }

  try {
    const validUsername = await validateUser(username);
    return res.json(validUsername);
  } catch (error){ 
      console.error("Error fetching LeetCode submission details:", error);
      res.status(500).json({ error: "Internal server error" });
      return false; 
  }

});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
