import bcrypt from "bcryptjs";
import { db } from "../config/db.js";

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await db.oneOrNone("SELECT password FROM users WHERE id=$1", [userId]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.none("UPDATE users SET password=$1 WHERE id=$2", [hashedPassword, userId]);

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};