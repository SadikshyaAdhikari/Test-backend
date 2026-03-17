import express from "express";
import { createPostController, getAllPostsController } from "../controllers/post.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { likePost, unlikePost } from "../controllers/likes.controller.js";

const router = express.Router();

router.post("/create", authMiddleware,upload.single("media"), createPostController);

//get all posts
router.get("/posts", getAllPostsController);

//like post
router.post("/:postId/like", authMiddleware, likePost);

//unlike post
router.delete("/:postId/like", authMiddleware, unlikePost);

export default router;