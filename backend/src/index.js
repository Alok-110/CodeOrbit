import express from "express";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/userAuth.js";
import { connectRedis } from "./configs/redis.js";



dotenv.config();
connectDB();
connectRedis();
const app = express();
app.use(express.json());
app.use(cookieParser());


app.use("/user", authRouter);

app.listen(process.env.PORT, () => {

    console.log("app listening at port 3000");
})
