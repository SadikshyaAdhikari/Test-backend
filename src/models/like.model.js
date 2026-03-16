import { db } from "../config/db.js";

export const createLikesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_post
            FOREIGN KEY (post_id)
            REFERENCES posts(id)
            ON DELETE CASCADE,
        UNIQUE (user_id, post_id)
    );
 `;
    return db.none(query);
}