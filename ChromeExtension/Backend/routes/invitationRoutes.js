import express from 'express';
import { createInvitation, getInvitationById, getAllInvitations, deleteAllInvitations, deleteInvitationById } from '../controllers/invitationCodeController.js';

const router = express.Router();

// Invitation Code Routes
router.get('/all', getAllInvitations);
router.get('/:id', getInvitationById);
router.post('/', createInvitation);
router.delete('/all', deleteAllInvitations);
router.delete('/:id', deleteInvitationById);

export default router;
