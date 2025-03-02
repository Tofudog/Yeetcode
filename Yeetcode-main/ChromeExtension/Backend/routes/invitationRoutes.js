import express from 'express';
import { invitationController } from '../controllers/invitationController.js';

const router = express.Router();
router.post('/generate', invitationController.generateInvitationCode);

export default router;
