import { getLanguageById } from "../utils/languageMap.js";
import { runBatch } from "./judge0Services.js";
import Problem from "../models/problemModel.js";
import User from "../models/userModel.js";



// 1. VALIDATION LOGIC (reusable)
export const validateProblem = async (data) => {
  const { referenceSolution, visibleTestCases } = data;

  if (!referenceSolution?.length || !visibleTestCases?.length) {
    throw new Error("referenceSolution and visibleTestCases are required");
  }

  for (const element of referenceSolution) {
    const languageId = getLanguageById(element.language);

    const submissions = visibleTestCases.map(tc => ({
      source_code: element.completeCode,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output
    }));

    const results = await runBatch(submissions);

    const allPassed = results.every(r => r.status_id === 3);

    if (!allPassed) {
      throw new Error(`Validation failed for ${element.language}`);
    }
  }
};


// 2. CREATE PROBLEM
export const validateAndCreateProblem = async (data, userId) => {
  await validateProblem(data);

  return await Problem.create({
    ...data,
    problemCreator: userId
  });
};


// 3. UPDATE PROBLEM
export const updateProblemService = async (id, data) => {

  // validate only if relevant fields are being updated
  if (data.referenceSolution || data.visibleTestCases) {
    await validateProblem(data);
  }

  const updatedProblem = await Problem.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  if (!updatedProblem) {
    throw new Error("Problem not found");
  }

  return updatedProblem;
};

export const getAllProblemsService = async (page, limit) => {
  const skip = (page - 1) * limit;

  return await Problem.find()
    .select("-hiddenTestCases")
    .skip(skip)
    .limit(limit);
};

export const getProblemByIdService = async (id) => {
  const problem = await Problem.findById(id).select("-hiddenTestCases");

  if (!problem) throw new Error("Problem not found");

  return problem;
};



export const getSolvedProblemsService = async (userId) => {
  const user = await User.findById(userId).populate("problemSolved");

  return user.problemSolved;
};


export const getSubmittedProblemsService = async (userId, problemId) => {
  return await Submission.find({
    userId,
    problemId
  });
};