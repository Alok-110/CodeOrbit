import express from "express";
import { login, register } from "../controllers/authController.js";


const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
// authRouter.post("/logout", logout);
// authRouter.get("getProfile", getProfile);

export default authRouter;