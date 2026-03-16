import {
  verifyToken,
  verifyRefreshToken,
  generateToken,
} from "../utils/token.js";
import { findUserById } from "../models/user.model.js";

// export const authMiddleware = async (req, res, next) => {
//   try {
//     const accessToken = req.cookies.accessToken;

//     if (accessToken) {
//       try {
//         const decoded = verifyToken(accessToken);
//         const user = await findUserById(decoded.id);

//         if (!user) {
//           return res.status(401).json({ error: "User not found" });
//         }

//         req.user = user; 
//         return next();
//       } catch (err) {
//         if (err.message !== "Invalid token") {
//           return res.status(401).json({ error: "Invalid access token" });
//         }
//       }
//     }

    
//     const refreshToken = req.cookies.refreshToken;

//     if (!refreshToken) {
//       return res.status(401).json({ error: "Session expired" });
//     }

//     const decodedRefresh = verifyRefreshToken(refreshToken);
//     const user = await findUserById(decodedRefresh.id);

//     if (!user || user.refresh_token !== refreshToken) {
//       return res.status(401).json({ error: "Invalid refresh token" });
//     }

//     const newAccessToken = generateToken(user);

//     res.cookie("accessToken", newAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Lax",
//       maxAge: 15 * 60 * 1000,
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Lax",
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     req.user = user; 
//     next();

//   } catch (error) {
//     console.error("Auth middleware error:", error);
//     return res.status(401).json({ error: "Authentication failed" });
//   }
// };

export const authMiddleware = async (req, res, next) => {
  try {

    console.log("Cookies:", req.cookies);

    const accessToken = req.cookies.accessToken;

    if (accessToken) {
      try {
        const decoded = verifyToken(accessToken);
        const user = await findUserById(decoded.id);

        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        return next();

      } catch (err) {
        console.log("Access token invalid, trying refresh...");
      }
    }

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Session expired" });
    }

    const decodedRefresh = verifyRefreshToken(refreshToken);
    const user = await findUserById(decodedRefresh.id);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = generateToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};