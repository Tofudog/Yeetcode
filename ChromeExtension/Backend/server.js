import express from 'express';
import bodyParser from 'body-parser';
import http from 'http'; 
import { WebSocketServer } from 'ws';
import connectDB from './config/db.js';
import gameRoutes from './routes/gameRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

// Store connected clients
let clients = {};

// WebSocket connection handling
wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("message", (message) => {
        const data = JSON.parse(message);
        
        if (data.type === "CREATE_GAME") {
            clients[data.gameId] = ws;
        }

        if (data.type === "PLAYER_JOINED") {
            if (clients[data.gameId]) {
                clients[data.gameId].send(JSON.stringify(data));
            }
        }

        if (data.type === "START_GAME") {
            if (clients[data.gameId]) {
                clients[data.gameId].send(JSON.stringify(data));
            }
        }
    });

    ws.on("close", () => {
        console.log("WebSocket closed");
    });
});

app.get("/", (_, res) => res.json({ message: "Welcome to Yeetcode API" }));

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});