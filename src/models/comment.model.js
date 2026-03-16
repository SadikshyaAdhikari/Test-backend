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