import { createPost, getAllPosts } from "../models/post.model.js";

export const createPostController = async (req, res) => {
  try {
    const userId = req.user.id;   // from auth middleware
    const { text = '' } = req.body;
    let mediaUrl = null;

    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
    }

    const post = await createPost(userId, text, mediaUrl);

    res.status(201).json({
      message: "Post created successfully",
      post
    });

  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Error creating post" });
  }
};


//get all posts 
export const getAllPostsController = async (req, res) => {
  try {
    const posts = await getAllPosts();

    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
    });

  } catch (error) {
    console.error("Fetch posts error:", error);
    res.status(500).json({
      message: "Error fetching posts",
    });
  }
};

