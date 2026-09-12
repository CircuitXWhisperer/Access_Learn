import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = (process.env.MONGO_URI?.trim() || 'mongodb://127.0.0.1:27017/note-app').replace(/\/$/, '');
        await mongoose.connect(mongoUri.endsWith('/note-app') ? mongoUri : `${mongoUri}/note-app`);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.warn('MongoDB connection failed. Continuing without MongoDB connection.');
        console.warn(error instanceof Error ? error.message : error);
    }
};

export default connectDB;