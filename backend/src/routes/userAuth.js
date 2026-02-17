import express from "express";
import { adminRegister, login, logout, register } from "../controllers/authController.js";
import tokenValidator from "../middlewares/tokenValidator.js";
import { getProfile } from "../controllers/userController.js";
import adminOnly from "../middlewares/adminMiddleware.js";


const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", tokenValidator,  logout);
authRouter.post("/admin/register", tokenValidator, adminOnly,  adminRegister);
authRouter.get("/getProfile", tokenValidator, getProfile);

export default authRouter;