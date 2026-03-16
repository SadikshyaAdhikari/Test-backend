import { db } from "../config/db.js";

export const createPostsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        media_url STRING,
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