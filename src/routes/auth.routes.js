import express from 'express';
import { logoutUser, logoutFromAllDevices, refreshToken, registerUser, currentUser, findUserByIdController } from '../controllers/auth.controllers.js';
import { loginUser } from '../controllers/auth.controllers.js';
import { deleteUser } from '../controllers/auth.controllers.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { superAdminOnly } from '../middleware/superAdminOnly.js';
import { viewMyDetails } from '../controllers/auth.controllers.js';
import { userOnly } from '../middleware/userOnly.js';
import { verifyRefreshTokenMiddleware } from '../middleware/verifyTokenMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { forgotPassword, resendOtp, resetPassword, verifyOtp } from '../controllers/forgetPassword.controller.js';
import { changePassword } from '../controllers/updatePassword.controller.js';


const router = express.Router();

// Registration route
router.post('/register', registerUser);

//Login route
router.post('/login', loginUser);

router.delete('/delete/:id', authMiddleware, deleteUser);


// router.post('/me', viewMyDetails);
// router.get('/me/:id',authMiddleware, userOnly, viewMyDetails);

router.post('/refresh-token', verifyRefreshTokenMiddleware ,refreshToken);

router.post('/logout', logoutUser);

router.post('/logout-all-devices', authMiddleware, logoutFromAllDevices);

router.post('/forgot-password', forgotPassword);

router.post('/forgot-password/verify-otp' ,verifyOtp)

router.post('/reset-password/:reset_token', resetPassword)

router.post('/change-password', authMiddleware, changePassword)

router.post('/resend-otp', resendOtp)

router.get('/current-user', authMiddleware, currentUser);


router.get('/user/:id', authMiddleware, findUserByIdController);

                                                    
export default router;

// router.get('/me', (req, res) => {

//   if (!req.user) {
//     return res.status(401).json({ message: "Not authenticated" });
//   }

//   res.json({ user: req.user });

// });