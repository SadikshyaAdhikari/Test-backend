import { createPost, deletePost, editPost, getAllPosts, getMyPosts, getPostsWithCounts } from "../models/post.model.js"
import { db } from "../config/db.js";

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page -1) * limit;

    const userId = req.user.id; // get logged-in user ID from auth
    const posts = await getPostsWithCounts(userId, limit, offset);
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page -1) * limit;

    const posts = await getMyPosts(userId, limit, offset);
    res.json(posts);
  }
  catch (error) {
    console.error("Error fetching user's posts:", error);
    res.status(500).json({ message: "Server error" });

  }
};

//edit a post
export const editPostController = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { text } = req.body;

    //Get post first
    const post = await db.oneOrNone(
      `SELECT * FROM posts WHERE id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (!post) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const mediaUrl = req.file
      ? `/uploads/${req.file.filename}`
      : post.media_url;

      const updatedText = text ? text : post.text;

    // Check edit restriction
    const lastEditTime = post.last_edited || post.created_at;
    const diffHours =
      (new Date() - new Date(lastEditTime)) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return res.status(403).json({
        message: "You can only edit once every 24 hours",
      });
    }

    //Call model
    const updatedPost = await editPost(
      postId,
      userId,
      updatedText,
      mediaUrl
    );

    res.json(updatedPost);

  } catch (error) {
    console.error("Error editing post:", error);
    res.status(500).json({ message: "Server error" });
  }
};
};
