import express from "express";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import { connectRedis } from "./configs/redis.js";
import problemRouter from "./routes/problemRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { submitRouter } from "./routes/submissionRoutes.js";

dotenv.config();
connectDB();
connectRedis();
const app = express();
app.use(express.json());
app.use(cookieParser());


app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/problems", problemRouter);
app.use("/problems", submitRouter);

app.listen(process.env.PORT, () => {

    console.log("app listening at port 3000");
})
