import InvitationCode from '../models/invitationModel';
import invitation_code_generator from '../utils/invitationCodeGenerator';


// Get all invitation codes
const getAllInvitations = async (req, res) => {
  try {
    const invitations = await InvitationCode.find();
    res.status(200).json(invitations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one invitation code by ID
const getInvitationById = async (req, res) => {
  try {
    const invitation = await InvitationCode.findById(req.params.id);
    if (!invitation) return res.status(404).json({ message: 'Invitation code not found' });

    res.status(200).json(invitation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new invitation code
const createInvitation = async (req, res) => {
  const invitation_code = invitation_code_generator();

  const existingCode = await InvitationModel.findOne({ invitation_code });
  if (existingCode) {
    return res.status(400).json({ error: 'Invitation code already exists.' });
  }

  try {
    const newInvitation = new InvitationCode({ invitation_code });
    await newInvitation.save();
    res.status(201).json(newInvitation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete one invitation code by ID
const deleteInvitationById = async (req, res) => {
  try {
    const deletedInvitation = await InvitationCode.findByIdAndDelete(req.params.id);
    if (!deletedInvitation) return res.status(404).json({ message: 'Invitation code not found' });

    res.status(200).json({ message: 'Invitation code deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete all invitation codes
const deleteAllInvitations = async (req, res) => {
  try {
    await InvitationCode.deleteMany();
    res.status(200).json({ message: 'All invitation codes deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getAllInvitations, getInvitationById, createInvitation, deleteInvitationById, deleteAllInvitations };
