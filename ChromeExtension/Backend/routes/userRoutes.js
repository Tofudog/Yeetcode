import express from 'express';
import { getAllUsers, getUserById, deleteUserById, deleteAllUsers } from '../controllers/userController.js';

const router = express.Router();

// User Routes
router.get('/all', getAllUsers);
router.get('/:id', getUserById);
router.delete('/all', deleteAllUsers);
router.delete('/:id', deleteUserById);

export default router;
