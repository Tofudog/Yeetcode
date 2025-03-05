import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import gameRoutes from './routes/gameRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
app.get("/", (_, res) => res.json({ message: "Welcome to Yeetcode API" }));

// Port
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/invitationCodes', invitationRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
