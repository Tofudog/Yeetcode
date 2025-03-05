import Game from '../models/gameModel.js';
import User from '../models/userModel.js';
import InvitationCode from '../models/InvitationCodeModel.js';

// Get all games
const getAllGames = async (req, res) => {
  try {
    const games = await Game.find().populate('player_1_id player_2_id invitation_code_id');
    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one game by ID
const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('player_1_id player_2_id invitation_code_id');
    if (!game) return res.status(404).json({ message: 'Game not found' });

    res.status(200).json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new game
const createGame = async (req, res) => {
  const { player_1_id, player_2_id, invitation_code } = req.body;

  try {
    const invitation = await InvitationCode.findOne({ invitation_code, status: 'active' });
    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or inactive invitation code' });
    }

    const newGame = new Game({
      player_1_id,
      player_2_id,
      invitation_code_id: invitation._id
    });

    await newGame.save();

    invitation.status = 'inactive';
    await invitation.save();

    res.status(201).json(newGame);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete one game by ID
const deleteGameById = async (req, res) => {
  try {
    const deletedGame = await Game.findByIdAndDelete(req.params.id);
    if (!deletedGame) return res.status(404).json({ message: 'Game not found' });

    res.status(200).json({ message: 'Game deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete all games
const deleteAllGames = async (req, res) => {
  try {
    await Game.deleteMany();
    res.status(200).json({ message: 'All games deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getAllGames, getGameById, createGame, deleteGameById, deleteAllGames };
