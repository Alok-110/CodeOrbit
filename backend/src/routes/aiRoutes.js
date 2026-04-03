import express from "express"
import tokenValidator from "../middlewares/tokenValidator.js";
import { handleAIQuery } from "../controllers/aiController.js";

const aiRouter = express.Router();


aiRouter.post("/query", tokenValidator, handleAIQuery);

export default aiRouter;
