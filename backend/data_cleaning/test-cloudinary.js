import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import connectCloudinary from '../src/config/cloudinary.js'; // Ensure this matches your filename

dotenv.config();

async function testCloudinaryConnection() {
    console.log("☁️  Testing Cloudinary Connection...");

    try {
        // 1. Check if variables exist
        if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY) {
            throw new Error('Missing Cloudinary credentials in .env file');
        }

        // 2. Configure the library (Run your code)
        await connectCloudinary();

        // 3. THE ACTUAL TEST: Send a 'ping' to Cloudinary
        // We try to get basic account details. If credentials are wrong, this throws an error.
        const result = await cloudinary.api.ping();

        console.log("✅ SUCCESS: Cloudinary is connected!");
        console.log(`   Status: ${result.status}`);

    } catch (error) {
        console.error("❌ CONNECTION FAILED:");
        // Cloudinary errors are usually inside error.error or just error.message
        console.error(error.message || error);
        process.exit(1);
    }
}

testCloudinaryConnection();