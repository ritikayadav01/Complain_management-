import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configure environment variables
dotenv.config();

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkComplaints() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Dynamically import the Complaint model
    const { default: Complaint } = await import('../models/Complaint.model.js');
    
    // Find complaints with location data
    const complaints = await Complaint.find({
      'location.coordinates.0': { $exists: true }
    }).limit(5);

    console.log(`Found ${complaints.length} complaints with location data`);
    
    if (complaints.length === 0) {
      console.log('No complaints with location data found. Checking for any complaints...');
      const allComplaints = await Complaint.find().limit(5);
      console.log(`Found ${allComplaints.length} total complaints. Sample:`);
      allComplaints.forEach((c, i) => {
        console.log(`\nComplaint ${i + 1}:`);
        console.log(`- ID: ${c._id}`);
        console.log(`- Title: ${c.title}`);
        console.log(`- Has location: ${!!c.location}`);
        console.log(`- Location data:`, c.location);
      });
    } else {
      complaints.forEach((complaint, index) => {
        console.log(`\nComplaint ${index + 1}:`);
        console.log(`- ID: ${complaint._id}`);
        console.log(`- Title: ${complaint.title}`);
        console.log(`- Status: ${complaint.status}`);
        console.log(`- Location:`, complaint.location);
        console.log(`- Created At: ${complaint.createdAt}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Module not found. Make sure to run this script from the backend directory.');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } else {
      console.log('No active MongoDB connection to close');
    }
  }
}

// Run the function
checkComplaints().catch(console.error);
