import Problem from "../models/problemModel.js";
import Submission from "../models/submissionModel.js";
import User from "../models/userModel.js";
import { getLanguageById } from "../utils/languageMap.js";
import { runBatch } from "./judge0Services.js";


export const submitCodeService = async (userId, problemId, code, language) => {

  if (!userId || !problemId || !code || !language) {
    throw new Error("Missing fields");
  }

  // 1. fetch problem
  const problem = await Problem.findById(problemId);
  if (!problem) throw new Error("Problem not found");

  // 2. create submission FIRST
  const submission = await Submission.create({
    userId,
    problemId,
    language,
    code,
    status: "pending",
    testCasesTotal: problem.hiddenTestCases.length
  });

  // 3. prepare judge0 payload
  const languageId = getLanguageById(language);

  const submissions = problem.hiddenTestCases.map(tc => ({
    source_code: code,
    language_id: languageId,
    stdin: tc.input,
    expected_output: tc.output
  }));

  // 4. call judge0
  const results = await runBatch(submissions);

  // 5. evaluate
  let testCasesPassed = 0;
  let runtime = 0;
  let memory = 0;
  let status = "Accepted";
  let errorMessage = "";

  for (const test of results) {
    if (test.status_id === 3) {
      testCasesPassed++;
      runtime += parseFloat(test.time || 0);
      memory = Math.max(memory, test.memory || 0);
    } else {
      status = test.status_id === 4 ? "error" : "wrong";
      errorMessage = test.stderr || test.compile_output || "";
    }
  }

  // 6. update submission
  submission.status = status;
  submission.testCasesPassed = testCasesPassed;
  submission.runtime = runtime;
  submission.memory = memory;
  submission.errorMessage = errorMessage;

  await submission.save();

  // 7. update user if accepted
  if (status === "Accepted") {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { problemSolved: problemId.toString() }
    });
  }
 
  return {
    status,
    runtime,
    memory,
    testCasesPassed
  };
};