import express from "express";
import { adminRegister, deleteProfile, login, logout, register } from "../controllers/authController.js";
import tokenValidator from "../middlewares/tokenValidator.js";
import { getProfile } from "../controllers/userController.js";
import adminOnly from "../middlewares/adminMiddleware.js";


const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", tokenValidator,  logout);
authRouter.post("/admin/register", tokenValidator, adminOnly,  adminRegister);
authRouter.post("/me", tokenValidator, deleteProfile);


authRouter.get("/me", tokenValidator, (req, res) => {
    const user = {
        firstName: req.user.firstName,
        emailId: req.user.emailId,
        _id: req.user._id
    };

    res.status(200).json({
        user,
        message: "valid user"
    });
});

export default authRouter;