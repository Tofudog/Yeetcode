import Game from '../models/gameModel.js';
// import { v4 as uuidv4 } from 'uuid';

// Get all games
export const getAllGames = async (req, res) => {
  try {
    const games = await Game.find(); // Removed .populate()
    res.status(200).json(games);
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).json({ message: "Failed to retrieve games", error: err.message });
  }
};

// Create a new game
export const createGame = async (req, res) => {
  try {
    const { invitation_code, player_1 } = req.body;

    if (!invitation_code) {
      return res.status(400).json({ message: 'invitation_code is required' });
    }
    if (!player_1) {
      return res.status(400).json({ message: 'player_1\'s username is required' });
    }

    // Check if invitation_code already exists
    const existingGame = await Game.findOne({ invitation_code });
    if (existingGame) {
      return res.status(400).json({ message: 'Invitation code already in use' });
    }

    const newGame = new Game({
      invitation_code: invitation_code,
      player_1: player_1
    });

    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({ message: 'Error creating game', error });
  }
};

// Join a game
export const joinGame = async (req, res) => {
  try {
    const { invitation_code, username } = req.body;

    if (!invitation_code) {
      return res.status(400).json({ message: 'invitation_code is required' });
    }

    const game = await Game.findOne({ invitation_code });

    if (!game) {
      return res.status(400).json({ message: 'Invalid invitation code' });
    }

    if (game.player_2) {
      return res.status(400).json({ message: 'Player 2 already joined' });
    }

    if (game.player_1 === username) {
      return res.status(400).json({ message: 'You are already in this game as Player 1' });
    }

    game.player_2 = username;
    game.status = 'paired';
    await game.save();

    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error joining game', error });
  }
};

// Update game
export const updateGame = async (req, res) => {
  try {
    const gameId = req.params.id;
    const { player_1, player_2, invitation_code, status, configurations } = req.body;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Merge any fields provided in the request
    if (player_1 !== undefined) game.player_1 = player_1;
    if (player_2 !== undefined) game.player_2 = player_2;
    if (invitation_code !== undefined) game.invitation_code = invitation_code;
    if (status !== undefined) game.status = status;
    if (configurations !== undefined) game.configurations = configurations;

    await game.save();
    res.status(200).json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ message: 'Failed to update game', error });
  }
};

// Update game status
export const updateGameStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expect new status in body
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    game.status = status; // Update the game status
    await game.save();
    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error updating game status' });
  }
};

// Get a game by invitation code
export const getGameByInvitationCode = async (req, res) => {
  try {
    const { invitation_code_id } = req.params; // Get the invitation code from URL params
    const game = await Game.findOne({ invitation_code_id }).populate('player_1 player_2');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.status(200).json(game); // Return the game details
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving game by invitation code' });
  }
};

// Delete all games
export const deleteAllGames = async (req, res) => {
  try {
    const result = await Game.deleteMany({});
    res.status(200).json({ message: `Deleted ${result.deletedCount} games successfully.` });
  } catch (error) {
    console.error("Error deleting games:", error);
    res.status(500).json({ message: "Failed to delete games", error: error.message });
  }
};

// Get game by ID
export const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving game', error });
  }
};
