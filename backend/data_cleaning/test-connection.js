import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/mongodb.js'; // Note: In ESM, the .js extension is often required

// 1. Load environment variables
dotenv.config();

const testConnection = async () => {
    console.log("⏳ Starting connection test...");

    try {
        // Check if the variable is actually loaded
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is undefined. Check your .env file.');
        }

        // 2. Run your connection function
        await connectDB();

        // 3. Verify the connection state (1 means connected)
        if (mongoose.connection.readyState === 1) {
            console.log("✅ TEST PASSED: Successfully connected to database 'Musicify'.");
        } else {
            console.log("⚠️ Connection function ran, but database state is not 'connected'.");
        }

        // 4. Close the connection to stop the script from hanging
        await mongoose.disconnect();
        console.log("🔌 Connection closed successfully.");

    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        process.exit(1);
    }
};

testConnection();