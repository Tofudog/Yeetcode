import express from 'express';
import {getElo, updateElo} from '../controllers/eloController.js';

const router = express.Router();

// User Routes
router.post('/getElo', getElo);
router.post('/updateElo', updateElo);

export default router;