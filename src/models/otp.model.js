import { db } from "../config/db.js";

export const createOtpTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,

        user_id INTEGER NOT NULL,
        
        otp_hash TEXT NOT NULL,           
        purpose VARCHAR(50) NOT NULL,      
        
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,

        attempt_count INTEGER DEFAULT 0,  
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
            );
  `;
  return db.none(query);
};


// invalidate previous active OTPs
export const invalidateOldOtps = (userId, purpose) => {
  const query = `
    UPDATE otps
    SET is_used = true
    WHERE user_id = $1
      AND purpose = $2
      AND is_used = false
  `;
  return db.none(query, [userId, purpose]);
};

// create new OTP
export const createOtp = ({ userId, otpHash, purpose, expiresAt }) => {
  const query = `
    INSERT INTO otps (user_id, otp_hash, purpose, expires_at)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  return db.one(query, [userId, otpHash, purpose, expiresAt]);
};

// get valid OTP
// export const findValidOtp = (userId, otpHash, purpose) => {
//   console.log("purpose:",purpose)
//   const query = `
//     SELECT *
//     FROM otps
//     WHERE user_id = $1
//       AND otp_hash = $2
//       AND purpose = $3
//       AND is_used = false
//       AND expires_at::timestamp with time zone > NOW()
//   `;
//   return db.oneOrNone(query, [userId, otpHash, purpose]);
// };

// Check your otp.model.js - it should look like this:
export const findValidOtp = async (userId, otpHash, purpose) => {
  return await db.oneOrNone(
    `
    SELECT id, user_id, otp_hash, purpose, expires_at, is_used
    FROM otps
    WHERE user_id = $1
      AND otp_hash = $2
      AND purpose = $3
      AND is_used = false
      AND expires_at > NOW()
    `,
    [userId, otpHash, purpose]
  );
};
  

// mark OTP as used
export const markOtpAsUsed = (otpId) => {
  const query = `
    UPDATE otps
    SET is_used = true
    WHERE id = $1
  `;
  return db.none(query, [otpId]);
};

//  increment attempt count
export const incrementOtpAttempt = (otpId) => {
  const query = `
    UPDATE otps
    SET attempt_count = attempt_count + 1
    WHERE id = $1
  `;
  return db.none(query, [otpId]);
};

export const getLatestOtp = (userId, purpose) => {
  return db.oneOrNone(`
    SELECT *
    FROM otps
    WHERE user_id = $1
      AND purpose = $2
    ORDER BY created_at DESC
    LIMIT 1
  `, [userId, purpose]);
};
