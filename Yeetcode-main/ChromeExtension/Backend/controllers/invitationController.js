import InvitationCode from '../models/invitationModel';
import invitation_code_generator from '../utils/invitationCodeGenerator';

// Generate invitation code
const generateInvitationCode = async (req, res) => {
  const invitation_code = invitation_code_generator();

  const existingCode = await InvitationCode.findOne({ invitation_code });
  if (existingCode) {
    return res.status(400).json({ error: 'Invitation code already exists.' });
  }

  const newCode = new InvitationCode({
    invitation_code,
  });

  await newCode.save();
  res.status(201).json(newCode);
};

export default generateInvitationCode