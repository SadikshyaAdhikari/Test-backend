import { db } from '../config/db.js';

export async function createDatabase(dbName) {
  try {
    await db.none('CREATE DATABASE $1:name', [dbName]);
    console.log(`Database '${dbName}' created successfully`);
  } catch (error) {
    console.error('Error creating database:', error.message);
  }
}

export async function insertUser() {
  const query = `
    INSERT INTO users (name, email, address)
    VALUES
        ('Sudil', 'sp@gmail.com', 'lalitpur'),
        ('Alice', 'al@gmail.com', 'kathmandu'),
        ('Bob', 'bb@gmail.com', 'pokhara')
        Returning *;
  `;
    try {
    await db.any(query);

      console.log('Inserted data into users table');
  } catch (error) {
    console.error('Error inserting user data:', error.message);
  }
}
export const fetchUsers = async () => {
    const query =
     `SELECT email , name
      FROM users
      WHERE id > 2
      ORDER BY name ASC;`;
    try {
        const users = await db.any(query);
        console.log(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        return [];
    }
}



export async function updateUserEmail(userId, newEmail) {
  const query = `
    UPDATE users
    SET email = 'r@gmail.com'
    WHERE name = 'Ram'
    RETURNING *;
  `;
  try {
    const updatedUser = await db.any(query, [userId, newEmail]);
    console.log('Updated user email:', updatedUser);
  } catch (error) {
    console.error('Error updating user email:', error.message);
  }
}

// export async function updateUserEmail(name, newEmail) {
//   const query = `
//     UPDATE users
//     SET email = ${newEmail}
//     WHERE name = ${name}
//     RETURNING *;
//   `;
//   try {
//     const updatedUser = await db.any(query, [name, newEmail]);
//     console.log('Updated user email:', updatedUser);
//   } catch (error) {
//     console.error('Error updating user email:', error.message);
//   }
// }

export async function addColumnToUserTable() {
  const query = `
    ALTER TABLE users
    ADD COLUMN phone VARCHAR(15);
  `;
  try {
    await db.none(query);
    console.log("Added phone column to users table");
  } catch (error) {
    console.error("Error adding phone column:", error.message);
  } 
}

// export async function updatePhoneNumber(id, phoneNumber) {
//   const query = `
//     UPDATE users 
//     SET phone = ${phoneNumber}
//     WHERE id = ${id}
//     RETURNING *;
//   `;
//   try {
//     const updatedUser = await db.any(query, [id, phoneNumber]);
//     console.log('Updated user phone number:', updatedUser);
//   } catch (error) {
//     console.error('Error updating user phone number:', error.message);
//   }
  
// }

export async function updatePhoneNumber(id, phoneNumber) {
  const query = `
    UPDATE users 
    SET phone = ${phoneNumber}
    WHERE id = ANY($1::int[])
    RETURNING *;
  `;
  try {
    const updatedUser = await db.any(query, [id, phoneNumber]);
    console.log('Updated user phone number:', updatedUser);
  } catch (error) {
    console.error('Error updating user phone number:', error.message);
  }
  
}

export async function deleteUser(userId) {
  const query = `
    DELETE FROM users
    WHERE id = ANY($1::int[])
    RETURNING *;
  `;

  try {
    const deletedUser = await db.any(query, [userId]);
    console.log('Deleted user:', deletedUser);
  } catch (error) {
    console.error('Error deleting user:', error.message);
  } 
}

