import express from 'express';
import bodyParser from 'body-parser'; // Optional for parsing JSON
import connectDB from './config/db.js'; // Make sure to add .js extension
import gameRoutes from './routes/gameRoutes.js'; // Add .js extensions
import invitationRoutes from './routes/invitationRoutes.js'; // Add .js extensions
import userRoutes from './routes/userRoutes.js'; // Add .js extensions

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/games', gameRoutes);
app.use('/api/invitation', invitationRoutes);
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
