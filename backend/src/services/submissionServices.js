export const executeSubmission = async(data, userId){

    const { referenceSolution, hiddenTestCases } = data;

    for(const element of element){

        const languageID = getLanguageById(element.language);
        const submissions = hiddenTestCases.map(tc => ({

            source_code = element.completeCode,
            language_id = languageID,
            stdin = tc.input,
            expected_output = tc.output
        }))

        const results = await judge0Service.runBatch(submissions)

        const allPassed = results.every(r => r.status_id === 3)

        if (!allPassed) {
            throw new Error("Validation failed")
        }
    }
}