import { validateAndCreateProblem } from "../services/problemService.js"

const createProblem = async (req, res) => {

  const result = await validateAndCreateProblem(req.body, req.user._id)
  res.status(201).send(result)
  
}