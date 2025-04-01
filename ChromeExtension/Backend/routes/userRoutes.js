import express from 'express';
import { getAllUsers, getUserById, createUser, postRecentSubmissions, postValidUser, deleteUserById, deleteAllUsers } from '../controllers/userController.js';

const router = express.Router();

// User Routes
router.get('/all', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.post('/validate', postValidUser);
router.post('/submissions', postRecentSubmissions);
router.delete('/all', deleteAllUsers);
router.delete('/:id', deleteUserById);

export default router;
