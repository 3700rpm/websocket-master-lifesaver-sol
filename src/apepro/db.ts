import mongoose from 'mongoose'

export const connectDb = async () => {
  const conn = await mongoose.connect('mongodb://localhost:27017/apepro');

  if (conn) {
    console.log('Connected to MongoDB');
  } else {
    console.log('Failed to connect to MongoDB');
  }
};