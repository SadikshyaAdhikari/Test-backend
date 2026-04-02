
import { db } from "../config/db.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "../models/user.model.js";
import { createOtp, findValidOtp, getLatestOtp, invalidateOldOtps, markOtpAsUsed } from "../models/otp.model.js";
import { sendOtpEmail } from "../utils/email.js";
import dotenv from 'dotenv';

dotenv.config();


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    //  Find user
    const user = await findUserByEmail(email);

    if (!user) {
      return res.json({
        message: "If the email exists, an OTP has been sent"
      });
    }

    //  Invalidate old OTPs
    await invalidateOldOtps(user.id, "FORGOT_PASSWORD");

    //  Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //  Hash OTP
    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    console.log("Generated OTP:", otp);
    // console.log("OTP Hash:", otpHash);
    // console.log("User ID:", user.id);


    // Save OTP
    try {
      const otpExpiryMs = Number(process.env.OTP_EXPIRY);

      const expiresAt = new Date(Date.now() + otpExpiryMs);


      const result = await createOtp({
        userId: user.id,
        otpHash,
        purpose: "FORGOT_PASSWORD",
        expiresAt
      });
    } catch (err) {
      throw err;
    }

    await sendOtpEmail(user.email, otp);
    return res.json({
      message: "If the email exists, an OTP has been sent"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email, otp)

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const otpHash = await crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    console.log("hashedOtp", otpHash);


    const otpRecord = await findValidOtp(user.id, otpHash, "FORGOT_PASSWORD");
    console.log("OTP Record found:", otpRecord);

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const updateOtpState = await markOtpAsUsed(otpRecord.id);
    console.log("OTP marked as used:", updateOtpState);


    const resetToken = await crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");


    if (resetToken === null || resetToken === undefined || !resetTokenHash) {

      console.log("Reset token generation failed");
    }

    const TokenEnv = await process.env.RESET_TOKEN_EXPIRY;

    if (!TokenEnv) {
      throw new Error("RESET_TOKEN_EXPIRY is not defined in environment variables");
    }

    const expiryMinutes = await Number(TokenEnv);
    if (isNaN(expiryMinutes)) {
      throw new Error("RESET_TOKEN_EXPIRY is not a valid number");
    }

    const resetTokenExpires = new Date(
      Date.now() + expiryMinutes * 60 * 1000
    );

    const query = `
      UPDATE users
      SET reset_token = $1,
         reset_token_expires = $2 
    
      WHERE id = $3
      RETURNING *
    `;
    console.log("resetTokenHash:", resetTokenHash);
   const userTOken = await db.one(query, [resetTokenHash, resetTokenExpires.toISOString(), user.id]);

   if(!userTOken){
    console.log("Failed to update user with reset token");
   }
 

    return res.json({
      message: "OTP verified successfully",
      resetToken
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json({
        message: "If the account exists, a new OTP has been sent"
      });
    }

    const lastOtp = await getLatestOtp(user.id, "FORGOT_PASSWORD");

    if (lastOtp) {
      if (lastOtp.expires_at > new Date()) {
        return res.status(400).json({
          error: "OTP is still valid. Please wait before resending."
        });
      }
    }

    await invalidateOldOtps(user.id, "FORGOT_PASSWORD");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_EXPIRY)
    );

    await createOtp({
      userId: user.id,
      otpHash,
      purpose: "FORGOT_PASSWORD",
      expiresAt
    });

    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
      message: "OTP resent successfully"
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ error: "Failed to resend OTP" });
  }
};


export const resetPassword = async (req, res) => {

  try {
    const { newPassword } = req.body;
    const resetToken = req.params.reset_token;

    console.log("resetToken:",resetToken)

    if (!newPassword) {
      return res.status(400).json({
        message: " Newpassword are required"
      });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await db.oneOrNone(
      `
      SELECT id
      FROM users
      WHERE reset_token = $1
        AND reset_token_expires::timestamp with time zone > NOW()
      `,
      [resetTokenHash]
    );
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.none(
      `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expires = NULL,
          token = '',
          refresh_token = ''
      WHERE id = $2
      `,
      [hashedPassword, user.id]
    );

    return res.json({
      message: "Password reset successful. Please login again."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};






