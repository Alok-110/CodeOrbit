import { validateAndCreateProblem } from "../services/problemService.js"

const createProblem = async (req, res) => {
  try {
    const result = await validateAndCreateProblem(req.body, req.user._id)

    res.status(201).json({
      message: "Problem created successfully",
      data: result
    })

  } catch (err) {
    res.status(400).json({
      message: err.message
    })
  }
}

export { createProblem }