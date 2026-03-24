import express from "express";
import tokenValidator from "../middlewares/tokenValidator.js";
import {submitCode , runCode} from "../controllers/submissionController.js";


export const submitRouter = express.Router();

submitRouter.post("/:id/submit", tokenValidator, submitCode);
submitRouter.post("/:id/run", tokenValidator, runCode);
