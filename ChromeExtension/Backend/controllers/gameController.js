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
      return res.status(400).json({ message: 'player_1\'s yeetcode username is required' });
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
    const { invitation_code, player_2 } = req.body;

    if (!invitation_code) {
      return res.status(400).json({ message: 'invitation_code is required' });
    }

    if (!player_2) {
      return res.status(400).json({ message: 'player_2\'s yeetcode username is required' });
    }

    const game = await Game.findOne({ invitation_code });

    if (!game) {
      return res.status(400).json({ message: 'Invalid invitation code' });
    }

    if (game.player_2) {
      return res.status(400).json({ message: 'Player 2 already joined' });
    }

    if (game.player_1 === player_2) {
      return res.status(400).json({ message: 'You are already in this game as Player 1' });
    }

    game.player_2 = player_2;
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
    const { id } = req.params;
    const updateData = req.body;

    // Remove any undefined or null values from updateData
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const game = await Game.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ message: 'Error updating game', error: error.message });
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

export const updateGameSettings = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { difficulty, time_limit, selected_problems, problem_count } = req.body;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Update game settings
    game.game_settings = {
      ...game.game_settings,
      ...(difficulty && { difficulty }),
      ...(time_limit && { time_limit }),
      ...(selected_problems && { selected_problems }),
      ...(problem_count && { problem_count })
    };

    await game.save();
    res.json(game);
  } catch (error) {
    console.error('Error updating game settings:', error);
    res.status(500).json({ message: 'Error updating game settings', error: error.message });
  }
};
