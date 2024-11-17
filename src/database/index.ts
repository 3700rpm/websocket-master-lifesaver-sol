import mongoose from "mongoose";

const mongooseConnect = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/webmaster_sniper');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.log('❌ MongoDB connection failed');
  }
}

export default mongooseConnect;