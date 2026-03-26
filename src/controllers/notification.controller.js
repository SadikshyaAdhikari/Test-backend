import { db } from "../config/db.js";

export const getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await db.any(
      `SELECT n.*, u.username AS sender_username
       FROM notifications n
       JOIN users u ON n.sender_id = u.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    const formattedNotifications = notifications.map(n => ({
      ...n,
      message: `${n.sender_username} ${n.message}`
    }));

    res.json({ notifications: formattedNotifications });
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  const notificationId = req.params.id;

  try {
    await db.none(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1`,
      [notificationId]
    );
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



