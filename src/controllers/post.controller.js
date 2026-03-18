import { createPost, deletePost, getAllPosts, getMyPosts, getPostsWithCounts } from "../models/post.model.js"

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

//get posts with like and comment counts, and whether the current user liked each post
export const fetchPosts = async (req, res) => {
  try {
    const userId = req.user.id; // get logged-in user ID from auth
    const posts = await getPostsWithCounts(userId);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//delete a post
export const deletePostController = async (req, res) => {
  try {
    const postId = req.params.postId;
    const deletedPost = await deletePost(postId);
    res.json(deletedPost);
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//get posts of a specific user
export const getUserPostsController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await getMyPosts(userId);
    res.json(posts);
  }
  catch (error) {
    console.error("Error fetching user's posts:", error);
    res.status(500).json({ message: "Server error" });

  }
};