import { db } from "../config/db.js";

export const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL ,
      email VARCHAR(150) NOT NULL UNIQUE,
      password TEXT,
      role VARCHAR(20) DEFAULT 'user',
      token VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  return db.none(query);
};

export const insertUser = async (username, email, hashedPassword, role, token, refresh_token) => {
  const query = `
    INSERT INTO users (username, email, password, role, token,refresh_token)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  return db.one(query, [username, email, hashedPassword, role, token,refresh_token]);
};

export const insertToken = async (token, userId ) => {
  const query = `
    UPDATE users  
    SET token = $1
    WHERE id = $2
    RETURNING *;
  `;
  return db.one(query, [token, userId]);
}


export const findUserByEmail = async (email) => {
  return db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
};

export const deleteUserById = async (id) => {
  return db.none('DELETE FROM users WHERE id = $1', [id]);
};


export const findUserById = async (id) => {
  return db.oneOrNone('SELECT * FROM users WHERE id = $1', [id]);
};

// export const getUserDetails = async (id) => {
//   return db.oneOrNone('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [id]);
// };

export const getUserDetails = async (id) => {
  return db.oneOrNone(
    `SELECT id, username, email, role, google_id, auth_provider, created_at 
     FROM users 
     WHERE id = $1`,
    [id]
  );
};

export const addRefreshTokenColumn = async () => {
  const query = `
    ALTER TABLE users
    ADD COLUMN refresh_token VARCHAR(500) NULL;
  `;
  try{
  return db.none(query);
  } catch (error) {
    console.error("Error adding refresh_token column:", error.message);
  }
} ;

export const insertRefreshToken = async (refreshToken, userId) => {
  const query = `
    UPDATE users  
    SET refresh_token = $1
    WHERE id = $2                                                                                                                                           
    RETURNING *;
  `;
  return db.one(query, [refreshToken, userId]);
};


export const findUserByRefreshToken = async (refreshToken) => {
  return db.oneOrNone('SELECT * FROM users WHERE refresh_token = $1', [refreshToken]);
};

export const clearAllTokens = async (userId) => {
  const query = `
    UPDATE users  
    SET token = '', refresh_token = ''
    WHERE id = $1
    RETURNING *;
  `;
  return db.one(query, [userId]);
};


export const addDeletedColumns = async () => {
  const query = `
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
  `;

  try {
    await db.none(query);
    console.log("Soft delete columns added successfully");
  } catch (error) {
    console.error(
      "Error adding is_deleted and deleted_at columns:",
      error.message
    );
    throw error;
  }
};


export const softDeleteUserById = async (userId) => {
  const query = `
    UPDATE users
    SET 
      is_deleted = TRUE,
      deleted_at = NOW()
    WHERE id = $1 AND is_deleted = FALSE
    RETURNING id, role, is_deleted, deleted_at;
  `;

  return db.oneOrNone(query, [userId]);
};


export const reactivateUser = async (userId, hashedPassword, username) => {
  const query = `
    UPDATE users
    SET 
      is_deleted = false,
      deleted_at = NULL,
      password = $1,
      username = $2
    WHERE id = $3
    RETURNING *;
  `;
  return db.one(query, [hashedPassword, username, userId]);
};


export const addResetTokenColumn = async () => {
  const query = `
    ALTER TABLE users
    
    ADD COLUMN reset_token_expires VARCHAR(500) NULL;
  `;
  try{
  return db.none(query);
  } catch (error) {
    console.error("Error adding reset_token column:", error.message);
  }
} ;



export const addOAuthColumns = async () => {
  const query = `
    ALTER TABLE users 
    ADD COLUMN google_id VARCHAR(255) UNIQUE  ,
    ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'local';
  `;
  return db.none(query);
};


export const removeNotNullConstraintFromPassword = async () => {
  const query = `
    ALTER TABLE users
    ALTER COLUMN password DROP NOT NULL;
  `;
  return db.none(query);
}

export const getPublicUserById = async (userId) => {
  const query = `
    SELECT id, username, created_at
    FROM users
    WHERE id = $1 
  `;
  return db.oneOrNone(query, [userId]);
};