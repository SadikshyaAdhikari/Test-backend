import express from "express";
// import { googleCallback } from "../controllers/oAuth.controller.js";
// import { google } from "../controllers/oAuth.controller.js";
import { googleLogin } from "../controllers/googleAuth.controller.js";
const router = express.Router();

//google 
// router.get("/auth/google", google);

//callback route for google
// router.get("/auth/google/callback", googleCallback);

//google login route

router.post("/auth/google", googleLogin);
export default router;
