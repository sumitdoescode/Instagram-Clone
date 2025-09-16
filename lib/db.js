import mongoose from "mongoose";

const MONGODB_URI = `${process.env.DATABASE_URI}/${process.env.DB_NAME}`;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI);
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        throw new Error("MongoDB connection failed: " + error.message);
    }
};

export default connectDB;
