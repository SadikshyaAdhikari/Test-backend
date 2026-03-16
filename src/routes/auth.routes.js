import express from 'express';
import { logoutUser, logoutFromAllDevices, refreshToken, registerUser, currentUser } from '../controllers/auth.controllers.js';
import { loginUser } from '../controllers/auth.controllers.js';
import { deleteUser } from '../controllers/auth.controllers.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { superAdminOnly } from '../middleware/superAdminOnly.js';
import { viewMyDetails } from '../controllers/auth.controllers.js';
import { userOnly } from '../middleware/userOnly.js';
import { verifyRefreshTokenMiddleware } from '../middleware/verifyTokenMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { forgotPassword, resendOtp, resetPassword, verifyOtp } from '../controllers/forgetPassword.controller.js';


const router = express.Router();

// Registration route
router.post('/register', registerUser);

//Login route
router.post('/login', loginUser);

//Delete user route - Users can soft delete themselves, admins/sudo can delete any user
router.delete('/delete/:id', authMiddleware, deleteUser);


//view my details
// router.post('/me', viewMyDetails);
// router.get('/me/:id',authMiddleware, userOnly, viewMyDetails);

//refresh token route
router.post('/refresh-token', verifyRefreshTokenMiddleware ,refreshToken);

//logout route
router.post('/logout', logoutUser);

//logout from all devices route
router.post('/logout-all-devices', authMiddleware, logoutFromAllDevices);

//forgot password
router.post('/forgot-password', forgotPassword);

//Verify Otp
router.post('/forgot-password/verify-otp' ,verifyOtp)

//reset password
router.post('/reset-password/:reset_token', resetPassword)

//resend-otp
router.post('/resend-otp', resendOtp)

//current-user route
router.get('/current-user', authMiddleware, currentUser);


                                                    
// module.exports = router;
export default router;

// router.get('/me', (req, res) => {

//   if (!req.user) {
//     return res.status(401).json({ message: "Not authenticated" });
//   }

//   res.json({ user: req.user });

// });