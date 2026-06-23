import mongoose from "mongoose";
import { config } from "./env.js";

const connectDB = async () => {
  try {
    // ✅ Mongoose 9 — No options needed
    const conn = await mongoose.connect(config.mongoUri);

    console.log("─────────────────────────────────────");
    console.log(`✅ MongoDB Connected Successfully`);
    console.log(`📦 Host     : ${conn.connection.host}`);
    console.log(`🗄️  Database : ${conn.connection.name}`);
    console.log("─────────────────────────────────────");

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB Error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB Reconnected");
    });
//use mangoos to connect
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;