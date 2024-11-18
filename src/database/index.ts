import mongoose from "mongoose";

const mongooseConnect = async () => {
  try {
    // await mongoose.connect('mongodb://localhost:27017/webmaster_sniper');
    await mongoose.connect('mongodb+srv://root:rootpass@cluster0.vlwon.mongodb.net/webmaster_sniper?authSource=admin&replicaSet=atlas-6i8mul-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true')
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.log('❌ MongoDB connection failed');
  }
}

export default mongooseConnect;