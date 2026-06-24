import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  // Path where repos will be cloned
  reposPath: path.join(__dirname, "../../repos"),
};