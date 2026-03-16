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