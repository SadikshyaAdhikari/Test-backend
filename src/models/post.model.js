import { db } from "../config/db.js";

export const createPostsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        text TEXT ,
        media_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        CONSTRAINT fk_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    );
  `;
    return db.none(query);
}

//insert a new post
export const createPost = async (userId, text, mediaUrl) => {
    const query = `
    INSERT INTO posts (user_id, text, media_url)
    VALUES ($1, $2, $3)
    RETURNING *;
    `;
    return db.one(query, [userId, text, mediaUrl]);
};

//get all posts
export const getAllPosts = async () => {
    const query = `
    SELECT 
      posts.id,
      posts.text,
      posts.media_url,
      posts.like_count,
      posts.comment_count,
      posts.created_at,
      users.id AS user_id
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `;

    return db.any(query);
};