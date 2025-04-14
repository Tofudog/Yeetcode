import express from 'express';
import { getAllGames, createGame, joinGame, updateGame, deleteAllGames, updateGameStatus, getGameById } from '../controllers/gameController.js';

const router = express.Router();

// Game Routes
router.get('/', getAllGames);
router.get('/:id', getGameById);
router.post('/', createGame);
router.post('/join', joinGame);
router.patch('/:id', updateGame);
router.patch('/:id/status', updateGameStatus);
router.patch('/:id/config', updateGameConfig);
router.delete('/', deleteAllGames); 

export default router;