import express from "express";
import { llmSearch } from "../controllers/llmSearchController.js";
import { verifyToken } from "../middleware/userMiddleware.js";

const router = express.Router();

router.post("/llm-search", verifyToken, llmSearch);

export default router;
