import User from '../models/userModel.js';

import { fetchRecentSubmissions, validateUser } from '../utils/leetcodeGraphQLQueries.js';

// Create a new user
const createUser = async (req, res) => {
  const { username } = req.body;

  try {
    const newUser = new User({ username });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * Query for user's recent submissions.
 * 
 * @return A dictionary of submisisons arrays.
 *  
 * submissionDict[index] has three fields: title, timestamp, and stauts.
 * submissionDict starts at index 0, submissionDict[0].title will get the title for the user's (most recent) submission.
 *
 */
const postRecentSubmissions = async (req, res) => {
  const { username, limit } = req.body
  try {
    if (!username || !limit) {
        res.status(404).json({ message: "username and limit is required" });
    }
    const submissionDict = await fetchRecentSubmissions(username, limit); 
    res.status(200).json(submissionDict);

  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}

/**
 * Query for validating a username
 * 
 * @return A boolean if the username exists on leetcode. True if it does, false otherwise. 
 */

const postValidUser = async (req, res) => {
  const { username } = req.body;

  try {
    if(!username){ 
      return res.status(400).json({ error: "username is required"});
    }
    const validUsername = await validateUser(username);
    res.status(200).json(validUsername);
  } catch (error){ 
      res.status(500).json({ message: error.message });
  }

}

// Delete one user by ID
const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete all users
const deleteAllUsers = async (req, res) => {
  try {
    await User.deleteMany();
    res.status(200).json({ message: 'All users deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getAllUsers, getUserById, createUser, postRecentSubmissions, postValidUser, deleteUserById, deleteAllUsers };
