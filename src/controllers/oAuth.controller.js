import passport from "passport";
import { generateToken, generateRefreshToken } from "../utils/token.js";
import { insertToken, insertRefreshToken } from "../models/user.model.js";
import dotenv from 'dotenv';

dotenv.config();



export const google = passport.authenticate(
  "google",
  { scope: ["profile", "email"],
    prompt: "select_account",
     session: false
    }
);
                                                                                                         
export const googleCallback = [
   passport.authenticate("google", { failureRedirect: "/login", session: false }),
  async (req, res) => {
    try {

      const user = req.user;

      // generate JWT tokens
      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(accessToken);

      await insertToken(accessToken, user.id);
      await insertRefreshToken(refreshToken, user.id);

      // set cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE),
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
      });

      console.log("OAuth success user:", user);

      res.redirect("http://localhost:5173/dashboard");

    } catch (err) {
      console.error("OAuth callback error:", err);
      res.redirect("http://localhost:5173/login");
    }
  }
];