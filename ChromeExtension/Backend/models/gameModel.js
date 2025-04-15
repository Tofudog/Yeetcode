import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  invitation_code: {
    type: String,
    default: null
  },
  player_1: {
    // type: mongoose.Schema.Types.ObjectId,
    type: String,
    // ref: 'User',
    default: null
  },
  player_2: {
    type: String,
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'User',
    default: null
  },
  winner: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'User',
    type:String,
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'paired', 'in_progress', 'completed'],
    default: 'waiting'
  },
  code_expires_at: {
    type: Date,
    default: () => Date.now() + 15 * 60 * 1000 // Expires in 15 minutes
  },
  score: {
    player_1: { type: Number, default: 0 },
    player_2: { type: Number, default: 0 }
  },
  // New game settings fields
  game_settings: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    time_limit: {
      type: Number,
      default: 0 // Default 30 minutes
    },
    selected_problems: [{
      type: String // Array of problem slugs
    }],
    problem_count: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

const Game = mongoose.model('Game', GameSchema);

export default Game;
