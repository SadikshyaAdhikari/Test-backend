import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { deleteUserById, findUserByEmail, getUserDetails, insertRefreshToken, insertToken, insertUser, clearAllTokens, findUserById, softDeleteUserById, reactivateUser} from '../models/user.model.js';
import { generateRefreshToken, generateToken} from '../utils/token.js';
import dotenv from 'dotenv';

dotenv.config();


export const registerUser = async (req, res) => {
  // console.log('Cookies: ', req.cookies)
  try {
    const { username, email, password, role } = req.body; 
    const user = await findUserByEmail(email);
    // console.log("user",user)

  if(user && user.is_deleted){
    const hashedPassword = await bcrypt.hash(password, 10);
       const reactivatedUser = await reactivateUser(
         user.id,
         hashedPassword,
        username
       );

       const accessToken = generateToken(user);
       const refreshToken = generateRefreshToken(accessToken);

       await insertToken(accessToken, reactivatedUser.id);
       await insertRefreshToken(refreshToken, reactivatedUser.id);

        res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE)
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE)
      });

      return res.status(200).json({
        user: reactivatedUser,
        message: 'Account reactivated successfully',
        accessToken,
        refreshToken
      });
    }

    if (user) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await insertUser(username, email, hashedPassword, role, '', '');
    // console.log('Registered new user:', newUser);

    // Auto-login: Generate tokens with the newly created user ID
    const accessToken = generateToken({ id: newUser.id, email, role });
    // console.log("token:", accessToken);
    const refreshToken = await generateRefreshToken(accessToken);
    // console.log("refreshtoken:", refreshToken);

    // Update user with tokens
    await insertToken(accessToken, newUser.id);
    await insertRefreshToken(refreshToken, newUser.id);

    //set cookie with access token and refresh token
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE)
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE)
    });
    
    res.status(201).json({ 
       user: newUser, 
       message: 'User registered successfully and auto-logged in',
       accessToken,
       refreshToken
    }); 
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Registration failed' });
  } 
}


export const loginUser = async (req, res) => {
  // console.log('Cookies: ', req.cookies)
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);
        // console.log("User:", user)

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        
        if(user.is_deleted == true){
           return res.status(403).json({ error: 'this account is deactivated' });
        }
        

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }  
        // console.log('User logged in:', user); 
        const accessToken = generateToken(user);
        console.log('Generated token:', accessToken);

        const insertedTokenUser = await insertToken(accessToken, user.id);
        // console.log('Updated user with token:', insertedTokenUser);
       
        //refresh token
         const refreshToken = generateRefreshToken(accessToken);
         console.log('Generated refresh token:', refreshToken);
         const updatedUserWithRefreshToken = await insertRefreshToken(refreshToken, user.id);
          // console.log('Updated user with refresh token:', updatedUserWithRefreshToken);


        //set cookie with access token and refresh token
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE)
        });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE)
        });
        res.cookie('id', user.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
          maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE)
        });


        res.status(200).json({ 
            message: 'Login successful',
            id: user.id,
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}






export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(userId)
    const currentUser = req.user;

    // Prevent deleting self
    // if (currentUser.id === userId) {
    //   return res.status(400).json({ error: "You cannot delete yourself" });
    //}

    const userToDelete = await findUserById(userId);

    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }
    
   if (currentUser.role === "user" && currentUser.id === userId) {
      await softDeleteUserById(userId);
      return res.status(200).json({
        message: "Your account has been deactivated successfully",
     });
    }
      
    if (currentUser.role === "user") {
       return res.status(403).json({
         error: "You are not allowed to delete other users",
         });
        }


    // Prevent deleting super admin
    if (userToDelete.role === "sudo" && currentUser.role !== "sudo") {
      return res.status(403).json({ error: "You cannot delete a super admin" });
    }

    //prevent admin deleting admin
    if(userToDelete.role === "admin" && currentUser.role !== "sudo"){
            return res.status(403).json({ error: "Only SuperAdmin can delete admin!" });

    }
    await deleteUserById(userId);

    return res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Deletion failed" });
  }
};


export const viewMyDetails = async (req, res) => {
    // console.log(req.body)
  try {
    
    // const userId = req.body.id;
    const userId = req.params.id;

    
    console.log('Fetching details for user ID:', userId);
    const userDetails = await getUserDetails(userId);



    if (!userDetails) {
      
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user: userDetails });
    } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user details" });
    }
};

//refresh token endpoint
export const refreshToken = async (req, res) => {
  try {
    const user = req.user; 

    const newAccessToken = generateToken(user);

    const newRefreshToken = generateRefreshToken(newAccessToken);
    // console.log('Generated new access token:', newAccessToken);
    // console.log('Generated new refresh token:', newRefreshToken);

    await insertToken(newAccessToken, user.id);
    await insertRefreshToken(newRefreshToken, user.id);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE)
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE)
    });

    return res.status(200).json({ message: "Token refreshed" });


  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ error: "Token refresh failed" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Clear the authentication cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

export const logoutFromAllDevices = async (req, res) => {
  try {
    const user = req.user; 
    // console.log("loggedout user",user)
    
    // Clear all tokens for this user in the database
    await clearAllTokens(user.id);
    console.log("userID",user.id)

    
    // Clear the authentication cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: "Logged out from all devices successfully" });
  } catch (error) {
    console.error("Error logging out from all devices:", error);
    res.status(500).json({ error: "Logout from all devices failed" });
  }
};


//current user 
export const currentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserDetails(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    console.error("Fetch current user error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


//find user by id
export const findUserByIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    console.error("Fetch user by ID error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
