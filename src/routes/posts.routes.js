import express from "express";
import { createPostController, getAllPostsController } from "../controllers/post.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware,upload.single("media"), createPostController);

//get all posts
router.get("/posts", getAllPostsController);

export default router;