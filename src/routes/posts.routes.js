import express from "express";
import { createPostController, deletePostController, editPostController, fetchPosts, getAllPostsController, getPublicProfile, getUserPostsController, searchPostsController } from "../controllers/post.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { likePost, unlikePost } from "../controllers/likes.controller.js";
import { addComment, deleteCommentController, getComments } from "../controllers/comments.controller.js";
import { userOnly } from "../middleware/userOnly.js";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";

const router = express.Router();


router.post("/create", authMiddleware,upload.single("media"), createPostController);
router.get("/posts", authMiddleware, fetchPosts);
router.get("/user/:userId/posts", authMiddleware, getUserPostsController);
router.put("/edit/:postId", authMiddleware, upload.single("media"), editPostController);
router.post("/search", authMiddleware, searchPostsController);
router.delete("/:postId", authMiddleware, deletePostController);    
router.get("/users/:userId",authMiddleware, getPublicProfile);


//LIKING
router.post("/:postId/like", authMiddleware, likePost);
router.delete("/:postId/like", authMiddleware, unlikePost);


//COMMENTING
router.post("/:postId/comments", authMiddleware, addComment);
router.get("/:postId/comments", authMiddleware, getComments);
router.delete("/comments/:commentId", authMiddleware, deleteCommentController);


//NOTIFICATION
router.get("/notifications", authMiddleware, getNotifications);
router.put("/:id/read", authMiddleware, markAsRead);


export default router;

