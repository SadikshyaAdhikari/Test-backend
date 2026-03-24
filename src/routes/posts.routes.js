import express from "express";
import { createPostController, deletePostController, editPostController, fetchPosts, getAllPostsController, getPublicProfile, getUserPostsController, searchPostsController } from "../controllers/post.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { likePost, unlikePost } from "../controllers/likes.controller.js";
import { addComment, deleteCommentController, getComments } from "../controllers/comments.controller.js";
import { userOnly } from "../middleware/userOnly.js";

const router = express.Router();

//create a new post
router.post("/create", authMiddleware,upload.single("media"), createPostController);

//get all posts
router.get("/posts", authMiddleware, fetchPosts);

//get all posts of a user
router.get("/user/:userId/posts", authMiddleware, getUserPostsController);

//edit post
router.put("/edit/:postId", authMiddleware, upload.single("media"), editPostController);

//search posts
router.post("/search", authMiddleware, searchPostsController);

//delete post
router.delete("/:postId", authMiddleware, deletePostController);    

//public profile
router.get("/users/:userId",authMiddleware, getPublicProfile);


//LIKING

//like post
router.post("/:postId/like", authMiddleware, likePost);

//unlike post
router.delete("/:postId/like", authMiddleware, unlikePost);





//COMMENTING

//add comment
router.post("/:postId/comments", authMiddleware, addComment);

//get comments for a post
router.get("/:postId/comments", authMiddleware, getComments);

//delete comment
router.delete("/comments/:commentId", authMiddleware, deleteCommentController);


export default router;

