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
  configurations: {
    difficulty: { type: String, default: null },
    numProblems: { type: Number, default: null },
    timeLimit: { type: Number, default: null },
    battleType: { type: String, default: null },
    questions: [{
      id: String,
      title: String,
      difficulty: String,
      difficultyLevel: Number,
      url: String
    }],
    default:{}
  },
  code_expires_at: {
    type: Date,
    default: () => Date.now() + 15 * 60 * 1000 // Expires in 15 minutes
  },
  score: {
    player_1: { type: Number, default: 0 },
    player_2: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Game = mongoose.model('Game', GameSchema);

export default Game;
