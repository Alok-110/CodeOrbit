import express from "express";
import dotenv from "dotenv";
import connectDB from "./configs/db";
import cookieParser from "cookie-parser";





dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.listen(process.env.PORT, () => {

    console.log("app listening at port 3000");
})
