import express from "express";
import { googleCallback } from "../controllers/oAuth.controller.js";

import { google } from "../controllers/oAuth.controller.js";
const router = express.Router();

//google 
router.get("/auth/google", google);

//callback route for google
router.get("/auth/google/callback", googleCallback);

export default router;
