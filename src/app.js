import express from "express";
import  router from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import googleRouter from "./routes/google.routes.js";
import postRouter from "./routes/posts.routes.js";
import multer from "multer";

const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));



// Middlewares
app.use(express.json());
app.use(cookieParser())


app.use("/uploads", express.static("uploads"));

// Routes will go here later
app.use("/api/auth",  router);
app.use("/api", googleRouter);

//post routes
app.use("/api", postRouter);


app.use((err, req, res, next) => {
  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message,
    });
  }

  // Custom errors (like fileFilter)
  if (err) {
    return res.status(400).json({
      message: err.message,
    });
  }

  next();
});

export default app;
