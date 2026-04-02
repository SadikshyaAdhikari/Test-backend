import { db } from "../config/db.js";

export const updateAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  try {
    await db.none("UPDATE users SET avatar_url=$1 WHERE id=$2", [avatarUrl, req.user.id]);
    console.log(req.user.id);
    res.json({ avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update avatar" });
  }
};