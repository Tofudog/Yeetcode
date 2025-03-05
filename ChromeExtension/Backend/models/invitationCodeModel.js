import mongoose from 'mongoose';

const InvitationCodeSchema = new mongoose.Schema({
  invitation_code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const InvitationCode = mongoose.model('InvitationCode', InvitationCodeSchema);

export default InvitationCode;
