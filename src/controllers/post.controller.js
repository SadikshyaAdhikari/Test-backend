import { createPost } from "../models/post.model.js";

export const createPostController = async (req, res) => {
  try {
    const userId = req.user.id;   // from auth middleware
    const { text, mediaUrl } = req.body;

    const post = await createPost(userId, text, mediaUrl);

    res.status(201).json({
      message: "Post created successfully",
      post
    });

  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};