import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
  }catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
