import Game from '../models/gameModel.js';
import User from '../models/userModel.js';
import InvitationCode from '../models/invitationModel.js';

// Example function to create a game
const createGame = async (req, res) => {
  const { player_1_id, player_2_id, invitation_code } = req.body;

  try {
    // Find the invitation code
    const invitation = await InvitationCode.findOne({ invitation_code, status: 'active' });
    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or inactive invitation code' });
    }

    // Create a new game
    const newGame = new Game({
      player_1_id,
      player_2_id,
      invitation_code_id: invitation._id
    });

    // Save the game
    await newGame.save();

    // Mark the invitation code as used
    invitation.status = 'inactive';
    await invitation.save();

    res.status(201).json(newGame);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default createGame