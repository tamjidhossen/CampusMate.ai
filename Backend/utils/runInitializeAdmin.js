const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { createDefaultAdmin } = require("./initializeAdmin");

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  }
};

// Runner function
const run = async () => {
  try {
    await connectDB();
    await createDefaultAdmin();
  } catch (err) {
    console.error("❌ Error running script:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

run();
