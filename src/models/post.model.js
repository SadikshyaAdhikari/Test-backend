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

//add a new column for last edited timestamp
export const addLastEditedColumn = async () => {
  const query = `
  ALTER TABLE posts
  ADD COLUMN last_edited TIMESTAMP DEFAULT NULL;
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


//get posts with like and comment counts, and whether the current user liked each post
export const getPostsWithCounts = async (userId) => {
  const query = `
    SELECT 
      posts.*,
      COALESCE(likes_count.count, 0) AS like_count,
      COALESCE(comments_count.count, 0) AS comment_count,
      CASE WHEN user_like.user_id IS NULL THEN false ELSE true END AS liked_by_user
    FROM posts
    -- Count total likes
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS count
      FROM likes
      GROUP BY post_id
    ) AS likes_count ON posts.id = likes_count.post_id
    -- Count total comments
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS count
      FROM comments
      GROUP BY post_id
    ) AS comments_count ON posts.id = comments_count.post_id
    -- Check if the current user liked the post
    LEFT JOIN likes AS user_like
      ON posts.id = user_like.post_id AND user_like.user_id = $1
    ORDER BY posts.created_at DESC;
  `;
  return db.any(query, [userId]);
};

//delete a post
export const deletePost = async (postId) => {
    const query = `
    DELETE FROM posts
    WHERE id = $1
    RETURNING *;
    `;
    return db.one(query, [postId]);
};

//get posts for a specific user
export const getMyPosts = async (userId, limit, offset) => {
  const query = `
    SELECT * FROM posts
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  return db.any(query, [userId, limit, offset]);
};

//edit a post
export const editPost = async (postId, userId, text, mediaUrl) => {
  const query = `
    UPDATE posts
    SET text = $3,
        media_url = $4,
        updated_at = CURRENT_TIMESTAMP,
        last_edited = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  return db.oneOrNone(query, [postId, userId, text, mediaUrl]);
};