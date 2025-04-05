import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  gamesPlayed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }],
  // elo: {
  //   type: Float32Array,
  //   default:
  // }
});

const User = mongoose.model('User', UserSchema);

export default User;
