import { createComment, deleteComment, getCommentsByPostId } from "../models/comment.model.js";

//adding comment to a post
export const addComment = async (req, res) => {
    try{
        const userId = req.user.id; 
        const { postId } = req.params;
        const { text } = req.body;
        
        const comment = await createComment(postId, userId, text);

        res.status(201).json({
            message: "Comment added successfully!",
            comment
        });
    } catch (error) {
        console.error("Error adding comment:", err);
        res.status(500).json({
            message: "Server error while adding comment."

        });
    }
};

//get comments for a post
export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await getCommentsByPostId(postId);

        res.status(200).json({
            message: "Comments fetched successfully!",
            comments
        });
    } catch (error) {
        console.error("Error fetching comments:", err);
        res.status(500).json({
            message: "Server error while fetching comments."
        });

    }
}


//delete a comment
export const deleteCommentController = async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!commentId) {
            return res.status(400).json({ message: "Comment ID is required" });
        }

        const deletedComment = await deleteComment(commentId);

        res.status(200).json({
            message: "Comment deleted successfully!",
            deletedComment
        });
    } catch (error) {
        console.error("Error deleting comment:", error); 
        res.status(500).json({
            message: "Server error while deleting comment."
        });
    }
};