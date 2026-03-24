import { getLanguageById } from "../utils/languageMap.js";
import { runBatch } from "./judge0Services.js";
import Problem from "../models/problemModel.js";


export const validateAndCreateProblem = async (data, userId) => {

    const { referenceSolution, visibleTestCases } = data;

    for(const element of referenceSolution){

        const languageId = getLanguageById(element.language);

        const submissions = visibleTestCases.map(tc => ({

            source_code: element.completeCode,
            language_id: languageId,
            stdin: tc.input,
            expected_output: tc.output
        }))

        const results = await runBatch(submissions)

        const allPassed = results.every(r => r.status_id === 3)

        if (!allPassed) {
            throw new Error("Validation failed")
        }
    }
    return await Problem.create({
        ...data,
        problemCreator: userId
    })
}