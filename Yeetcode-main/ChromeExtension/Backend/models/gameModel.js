import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  invitation_code_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvitationCode',
    default: null
  },
  player_1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  player_2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  winner: {
    type: String,
    enum: ['player_1', 'player_2', 'draw', null],
    default: null
  },
  date: {
    type: Date,
    default: null
  }
});

const Game = mongoose.model('Game', GameSchema);

export default Game; 
