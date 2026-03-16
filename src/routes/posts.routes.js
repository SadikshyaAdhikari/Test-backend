import express from "express";
import { createPostController } from "../controllers/post.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createPostController);

export default router;