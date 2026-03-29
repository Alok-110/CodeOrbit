import Problem from "../models/problemModel.js";
import { getLanguageById } from "../utils/languageMap.js";
import { runBatch } from "./judge0Services.js";


export const runCodeService = async (problemId, code, language) => {

  if (!problemId || !code || !language) {
    throw new Error("Missing fields");
  }

  const problem = await Problem.findById(problemId);
  if (!problem) throw new Error("Problem not found");

  const languageId = getLanguageById(language);

  const submissions = problem.visibleTestCases.map(tc => ({
    source_code: code,
    language_id: languageId,
    stdin: tc.input,
    expected_output: tc.output
  }));


  const results = await runBatch(submissions);

  return results;
};