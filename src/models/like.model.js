import { db } from "../config/db.js";
import { createNotification } from "./notification.model.js";

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

//Add a named unique constraint to prevent duplicate likes
export const addUniqueConstraint = async () => {
  const query = `
    ALTER TABLE likes
     ADD CONSTRAINT unique_user_post UNIQUE (user_id, post_id);
    `;
  return db.none(query);
};

export const createLike = async (userId, postId) => {
  try {
    // Attempt to insert a like; check if it actually happened
    const result = await db.result(
      `INSERT INTO likes (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING`,
      [userId, postId]
    );

    // Only increment like_count if a new like was inserted
    if (result.rowCount > 0) {
      await db.none(
        `UPDATE posts SET like_count = like_count + 1 WHERE id = $1`,
        [postId]
      );

      // get post owner
      const post = await db.one(
        `SELECT user_id FROM posts WHERE id = $1`,
        [postId]
      );

      if (post.user_id !== userId) {
        await createNotification(
          post.user_id,   // receiver
          userId,         // sender
          postId,
          "like",
          "liked your post"
        );
      }
    }

  } catch (err) {
    console.error("Error creating like:", err);
    throw err;
  }
};

//delete a like
export const deleteLike = async (userId, postId) => {
  const result = await db.result(
    `DELETE FROM likes
     WHERE user_id = $1 AND post_id = $2
     RETURNING *`,
    [userId, postId]
  );

  if (result.rowCount > 0) {
    await db.none(
      `UPDATE posts SET like_count = like_count - 1 WHERE id = $1`,
      [postId]
    );
  }
};

