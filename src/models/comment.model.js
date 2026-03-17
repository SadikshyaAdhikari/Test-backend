import { db } from "../config/db.js";

export const createCommentsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_post
            FOREIGN KEY (post_id)
            REFERENCES posts(id)
            ON DELETE CASCADE
    );
  `;
    return db.none(query);
}

export const createComment = async (postId, userId, text) => {
    // Insert the comment
    const queryInsert = `
        INSERT INTO comments (post_id, user_id, text)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const newComment = await db.one(queryInsert, [postId, userId, text]);

    // Increment comment_count in posts table
    const queryUpdateCount = `
        UPDATE posts
        SET comment_count = comment_count + 1
        WHERE id = $1;
    `;
    await db.none(queryUpdateCount, [postId]);

    return newComment;
}

//get comments by post id
export const getCommentsByPostId = async (postId) => {
    const query = `
    SELECT 
        comments.id,
        comments.text,
        comments.created_at,
        users.id AS user_id
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.post_id = $1
    ORDER BY comments.created_at ASC;
    `;
    return db.any(query, [postId]); 
    
}

//delete a comment
export const deleteComment = async (commentId) => {
    //get post_id before deleting
    const queryGetPostId = `
    SELECT post_id FROM comments WHERE id = $1;
    `;
    const { post_id } = await db.one(queryGetPostId, [commentId]);
     //delete
     const queryDelete = `
     DELETE FROM comments WHERE id = $1 
        RETURNING *;
        `;
    const deletedComment = await db.one(queryDelete, [commentId]);

    //decrement comment_count in posts table
    const queryUpdateCount = `
        UPDATE posts
        SET comment_count = comment_count - 1
        WHERE id = $1;
    `;
    await db.none(queryUpdateCount, [post_id]);
}