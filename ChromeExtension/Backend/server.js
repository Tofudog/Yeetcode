import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import gameRoutes from './routes/gameRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import userRoutes from './routes/userRoutes.js';
// import fetch from 'node-fetch';

const app = express();
app.get("/", (_, res) => res.json({ message: "Welcome to Yeetcode API" }));

// Port
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// LeetCode Submission Details Route
app.post('/api/recentSubmission', async (req, res) => {
  const { username, limit } = req.body
  console.log(username);
  console.log(limit);
  if (!username || !limit) {
      return res.status(400).json({ error: "username and limit is required" });
  }

  const query = `
      query recentSubmissions($username: String!, $limit: Int!) {
        recentSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
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
      console.log("this is submission details", data.data.recentSubmissionList)
      if (data.data && data.data.recentSubmissionList) {
          return res.json(data.data.recentSubmissionList);
      } else {
          res.status(404).json({ error: "Submission details not found or error retrieving data" });
      }
  } catch (error) {
      console.error("Error fetching LeetCode submission details:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/invitationCodes', invitationRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
