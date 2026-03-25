import { createLike, deleteLike } from "../models/like.model.js"; 

export const likePost = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { postId } = req.params;

    await createLike(userId, postId);

    res.status(201).json({ message: "Post liked successfully!" });
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ message: "Server error while liking post." });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { postId } = req.params;

    await deleteLike(userId, postId);

    res.status(200).json({ message: "Like removed successfully!" });
  } catch (err) {
    console.error("Error unliking post:", err);
    res.status(500).json({ message: "Server error while removing like." });
  }
};