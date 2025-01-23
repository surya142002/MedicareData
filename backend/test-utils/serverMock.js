import express from "express";
import userRoutes from "../routes/userRoutes.js";
import analyticsRoutes from "../routes/analyticsRoutes.js";
import datasetRoutes from "../routes/datasetRoutes.js";

// setup express app
const app = express();

// parse incoming json data
app.use(express.json());

// setup routes
app.use("/api/auth", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/datasets", datasetRoutes);

// export app
export default app;
