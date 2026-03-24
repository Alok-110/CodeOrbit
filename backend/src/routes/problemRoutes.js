import express from "express";
import adminOnly from "../middlewares/adminMiddleware.js";
import tokenValidator from "../middlewares/tokenValidator.js";
import {
  createProblem,
  // updateProblem,
  // deleteProblem,
  // solvedProblem,
  // getAllProblem,
  // getProblemById,
  // submittedProblem
} from "../controllers/problemController.js";

const problemRouter = express.Router();

// Admin routes
problemRouter.post("/", tokenValidator, adminOnly, createProblem);
// problemRouter.put("/:id", tokenValidator, adminOnly, updateProblem);
// problemRouter.delete("/:id", tokenValidator, adminOnly, deleteProblem);

// User routes
// problemRouter.get("/solved", tokenValidator, solvedProblem);
// problemRouter.get("/", tokenValidator, getAllProblem);
// problemRouter.get("/:id", tokenValidator, getProblemById);
// problemRouter.get("/submitted/:pid", tokenValidator, submittedProblem);

export default problemRouter;

