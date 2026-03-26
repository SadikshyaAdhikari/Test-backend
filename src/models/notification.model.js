import { db } from "../config/db.js";

export const createNotificationTable = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS notifications (
       id SERIAL PRIMARY KEY,
       user_id INT NOT NULL,              
       sender_id INT NOT NULL,            
       post_id INT,
       type VARCHAR(20),                 
       message TEXT,
       is_read BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
     `;
    return db.none(query);
};


export const createNotification = async (
  userId,
  senderId,
  postId,
  type,
  message
) => {
  return db.none(
    `INSERT INTO notifications (user_id, sender_id, post_id, type, message)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, senderId, postId, type, message]
  );
};