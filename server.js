// import session from "express-session";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from 'dotenv';
import { db } from "./src/config/db.js"; // or your db file path

dotenv.config();
// const app = express();

import app from "./src/app.js";

import { addColumnToUserTable, createDatabase, updatePhoneNumber } from "./src/services/database.service.js";
import { addDeletedColumns, addOAuthColumns, addResetTokenColumn, createUserTable, insertRefreshToken, insertToken, removeNotNullConstraintFromPassword } from "./src/models/user.model.js";
import { insertUser } from "./src/services/database.service.js";
import { fetchUsers } from "./src/services/database.service.js";
import { updateUserEmail } from "./src/services/database.service.js";
import { deleteUser } from "./src/services/database.service.js";
import { addRefreshTokenColumn } from "./src/models/user.model.js";
import { seedSudoAdmin } from "./src/seeders/seed.js";
import { createOtpTable } from './src/models/otp.model.js';
import { generateRefreshToken, generateToken } from "./src/utils/token.js";
import { createPostsTable } from './src/models/post.model.js';
import { createLikesTable } from './src/models/like.model.js';
import { createCommentsTable } from './src/models/comment.model.js';


//const PORT = 3000; //dont use this port here use it fronm env file

const PORT = process.env.PORT || 3000;

// Run startup tasks
// await createDatabase("hello");
// await createUserTable();
// await insertUser();
// await fetchUsers();
// await createUserTable();
// await updateUserEmail('Ram', 'r@gmail.com');
// await addColumnToUserTable();
// await updatePhoneNumber([26, 24], ['9876543210', '9865432109']);
// await deleteUser([25,35,37]);
// await addRefreshTokenColumn();
// await seedSudoAdmin();
// await addDeletedColumns();
// await createOtpTable();
// await addResetTokenColumn();
// await addOAuthColumns();
// await removeNotNullConstraintFromPassword();
await createPostsTable();
await createLikesTable();
await createCommentsTable();

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: false,
//     },
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser((user, done) => done(null, user.id));

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await db.one(
//       "SELECT * FROM users WHERE id = $1",
//       [id]
//     );
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL,
//     },
//  async (accessToken, refreshToken, profile, done) => {
//   try {

//     const email = profile.emails[0].value;
//     const googleId = profile.id;

//     // Check if google account already exists
//     let user = await db.oneOrNone(
//       "SELECT * FROM users WHERE google_id=$1",
//       [googleId]
//     );

//     if (user) {
//       return done(null, user);
//     }

//     // Check if email already exists
//     user = await db.oneOrNone(
//       "SELECT * FROM users WHERE email=$1",
//       [email]
//     );

//     if (user) {
//       // Only link Google account if no OAuth provider is already set
//       if (user.auth_provider === 'local' && !user.google_id) {
//         //  Link google account to existing user
//         await db.none(
//           `UPDATE users 
//            SET google_id=$1, auth_provider='google'
//            WHERE id=$2`,
//           [googleId, user.id]
//         );

//         user = await db.one(
//           "SELECT * FROM users WHERE id=$1",
//           [user.id]
//         );

//         return done(null, user);
//       } else if (user.auth_provider === 'google' && user.google_id === googleId) {
//         // Same Google account, return the user
//         return done(null, user);
//       } else {
//         // Email exists with different auth provider - don't link, create new user instead
//         // This prevents accidental account takeover
//         user = await db.one(
//           `INSERT INTO users (username,email,password,google_id,auth_provider)
//            VALUES ($1,$2,$3,$4,$5)
//            RETURNING *`,
//           [
//             profile.displayName,
//             email + '_' + googleId.substring(0, 8),
//             null,
//             googleId,
//             "google"
//           ]
//         );
//         return done(null, user);
//       }
//     }

//     //  Create completely new user
//     user = await db.one(
//       `INSERT INTO users (username,email,password,google_id,auth_provider)
//        VALUES ($1,$2,$3,$4,$5)
//        RETURNING *`,
//       [
//         profile.displayName,
//         email,
//         null,
//         googleId,
//         "google"
//       ]
//     );

//     return done(null, user);

//   } catch (err) {
//     console.error("Google OAuth error:", err);
//     return done(err, null);
//   }
// }
//   )
// );

//       try {
//         // insertUser should upsert by google_id and return the saved user row/object
//         const savedUser = await insertUser(userData);
//         return done(null, savedUser || profile);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   )
// );

app.get("/", (req, res) => res.send("Home page"));


app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
