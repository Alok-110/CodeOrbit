import express from "express"
import { getProfile } from "../controllers/userController.js";
import tokenValidator from "../middlewares/tokenValidator.js";


const userRouter = express.Router();
userRouter.get("/profile", tokenValidator, getProfile);

export default userRouter;
