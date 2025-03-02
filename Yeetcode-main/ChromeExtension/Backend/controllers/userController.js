import User from '../models/userModel.js';

// Example function to create a user
const createUser = async (req, res) => {
  const { username } = req.body;

  try {
    // Create a new user
    const newUser = new User({ username });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default createUser