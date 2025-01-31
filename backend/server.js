import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import sequelize from "./config/db.js";
import initModels from "./models/initModels.js";
import userRoutes from "./routes/userRoutes.js";
import datasetRoutes from "./routes/datasetRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// Load environment variables
dotenv.config();

const uploadDir = path.join(process.cwd(), "uploads");

// Ensure 'uploads/' directory exists at startup
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created 'uploads/' directory");
}

// Initialize express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(bodyParser.json());

// Serve frontend build files
const frontendBuildPath = path.join(process.cwd(), "../frontend/dist");
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// Initialize models
const models = initModels(sequelize);

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.error("Error connecting to database:", err));

// Synchronize models with the database
sequelize
  .sync({ alter: true }) // Use alter to avoid data loss
  .then(() => console.log("Models synchronized with database."))
  .catch((err) => console.error("Error synchronizing models:", err));

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/analytics", analyticsRoutes); // Add analytics routes

// ✅ Fix for React Router Refresh Issue
app.get("*", (req, res) => {
  res.sendFile(path.resolve(frontendBuildPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
