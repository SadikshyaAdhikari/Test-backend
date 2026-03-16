import express from "express";
import  router from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import googleRouter from "./routes/google.routes.js";
const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));



// Middlewares
app.use(express.json());
app.use(cookieParser())


// Routes will go here later
app.use("/api/auth",  router);
app.use("/", googleRouter);


export default app;
