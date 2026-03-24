const submitProblem = async(req, res) => {

    const result = await executeSubmission(req.body, req.user._id)
    res.status(201).send(result)
}