
import User from '../models/userModel.js';
import { hashPassword, comparePassword } from '../utils/hash-password.js';
import { validateUser } from '../utils/leetcodeGraphQLQueries.js';
import jwt from 'jsonwebtoken';   
const { sign } = jwt

// Create a new user
const signup = async (req, res) => {
    const { yeetcode_username, yeetcode_password, leetcode_username} = req.body;
    
    const leetUserExists = await validateUser(leetcode_username);
    if (!leetUserExists) {
      return res.status(400).json({success: false, message: "Leetcode user does not exist" });
    }

    const userExist = await User.findOne({ yeetcode_username });
    if(userExist) return res.status(400).json({success: false, message: "User already exist" });
    
    try {
      const newUser = new User({ yeetcode_username, yeetcode_password: await hashPassword(yeetcode_password), leetcode_username });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
const signin = async (req, res) => {
      const { yeetcode_username, yeetcode_password } = req.body;
      const user = await User.findOne({ yeetcode_username });
      if(!user) return res.status(401).json({success: false, message: "Invalid Credentials" });
  
      const isMatch = await comparePassword(yeetcode_password, user.yeetcode_password);
      if(!isMatch) return res.status(401).json({success: false, message: "Invalid Credentials" });
  
      const token = sign({ _id: user.yeetcode_username, name: user.leetcode_username }, process.env.JWT_KEY, { expiresIn: '1h' });
      return res.status(200).json({success: true, data: { token } });
  }
  
  export const getProfile = async (req, res) => {
      return res.status(200).json({success: true, data: req.user});
  }

export { signup, signin };