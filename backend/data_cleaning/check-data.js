import mongoose from "mongoose";
import dotenv from "dotenv";
import songModel from "../src/models/songModel.js"; 

dotenv.config();

const checkData = async () => {
    try {
        // Log the URI (hiding the password) to be 100% sure where we are going
        const sanitizedURI = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
        console.log(`🌐 Connecting to: ${sanitizedURI}/Musicify`); // We assume 'test' based on previous errors

        // Connect
        await mongoose.connect(`${process.env.MONGODB_URI}/Musicify`);
        
        console.log(`\n📂 Connected to Database: "${mongoose.connection.name}"`);

        // 1. RAW DIRECT CHECK (Bypassing Mongoose Schema)
        // We explicitly look for the 'songs' collection we saw in your log
        const collection = mongoose.connection.db.collection("songs");
        const rawCount = await collection.countDocuments();
        
        console.log(`\n🔢 RAW DB COUNT (Collection 'songs'): ${rawCount}`);

        // 2. MONGOOSE CHECK
        const mongooseCount = await songModel.countDocuments();
        console.log(`🐢 MONGOOSE COUNT (Model 'song'): ${mongooseCount}`);

        // 3. DIAGNOSIS
        if (rawCount > 0 && mongooseCount === 0) {
            console.log("\n🚨 PROBLEM FOUND: The data exists, but Mongoose isn't reading it.");
            console.log("   --> Fix: You need to force Mongoose to use the 'songs' collection.");
        } else if (rawCount === 0) {
            console.log("\n👻 PROBLEM FOUND: The 'songs' collection exists, but it is EMPTY.");
            console.log("   --> The songs you see in Compass might be in a different Cluster or Project.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();