import express from 'express';
import { getAllGames, createGame, joinGame, updateGame, deleteAllGames, updateGameStatus, getGameById, updateGameSettings } from '../controllers/gameController.js';

const router = express.Router();

// Game Routes
router.get('/', getAllGames);
router.get('/:id', getGameById);
router.post('/', createGame);
router.post('/join', joinGame);
router.patch('/:id', updateGame);
router.patch('/:id/settings', updateGameSettings);
router.patch('/:id/status', updateGameStatus);
router.delete('/', deleteAllGames);

export default router;