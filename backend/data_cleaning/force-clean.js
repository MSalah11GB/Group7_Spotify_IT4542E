import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const forceClean = async () => {
    console.log("🧨 Starting Force Clean...");

    try {
        // 1. Connect to the cluster (Generic connection)
        if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🔌 Connected to Cluster");

        // 2. FORCE SWITCH to 'Musicify' database
        // This ignores whatever DB name is in your .env file
        const db = mongoose.connection.useDb("Musicify");
        console.log(`🔀 Switched to database: "${db.name}"`);

        // 3. Select the 'songs' collection directly
        const collection = db.collection("songs");

        // 4. Run the update
        const result = await collection.updateMany(
            {}, // Filter: All documents
            { $unset: { fingerprints: 1 } } // Operation: Remove field
        );

        console.log("------------------------------------------------");
        console.log(`🎉 SUCCESS!`);
        console.log(`   - Matched Songs: ${result.matchedCount}`);
        console.log(`   - Modified Songs: ${result.modifiedCount}`);
        console.log("------------------------------------------------");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Connection closed");
        process.exit();
    }
};

forceClean();