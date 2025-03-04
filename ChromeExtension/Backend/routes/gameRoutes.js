import express from 'express';
import { getAllGames, getGameById, createGame, deleteGameById, deleteAllGames } from '../controllers/gameController.js';

const router = express.Router();

// Game Routes
router.get('/games', getAllGames);
router.get('/games/:id', getGameById);
router.post('/games', createGame);
router.delete('/games/:id', deleteGameById);
router.delete('/games', deleteAllGames);

export default router;
