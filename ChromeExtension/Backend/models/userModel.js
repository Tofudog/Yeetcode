import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  yeetcode_username: {
    type: String,
    required: true
  },
  yeetcode_password: {
    type: String,
    required: true
  },
  leetcode_username: {
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
  elo: {
    type: String,
    default: "1500"
  },
  title: {
    type: String,
    default: "Pupil"
  },
  bio: {
    type: String,
    default: ""
  },
  university: {
    type: String,
    default: ""
  }
});

const User = mongoose.model('User', UserSchema);

export default User;
