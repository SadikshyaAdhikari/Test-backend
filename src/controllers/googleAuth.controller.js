import { verifyGoogleToken } from "../utils/googleAuth.js";
import { generateToken, generateRefreshToken } from "../utils/token.js";
import { insertToken, insertRefreshToken } from "../models/user.model.js";
import { db } from "../config/db.js";

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const googleUser = await verifyGoogleToken(token);

    // Look for existing user
    let user = await db.oneOrNone(
      "SELECT * FROM users WHERE google_id=$1 OR email=$2",
      [googleUser.googleId, googleUser.email]
    );

    if (!user) {
      // Create new user
      user = await db.one(
        `INSERT INTO users (username, email, google_id, auth_provider)
         VALUES ($1, $2, $3, 'google') RETURNING *`,
        [googleUser.name, googleUser.email, googleUser.googleId]
      );
    }

    // Generate JWT
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(accessToken);

    await insertToken(accessToken, user.id);
    await insertRefreshToken(refreshToken, user.id);

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
    });

    res.json({ message: "Login successful", user });

  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ message: "Google login failed" });
  }
};