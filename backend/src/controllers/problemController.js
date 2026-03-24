import Problem from "../models/problemModel.js"
import {  
        getAllProblemsService, 
        getProblemByIdService, 
        getSolvedProblemsService, 
        getSubmittedProblemsService, 
        updateProblemService, 
        validateAndCreateProblem 
      } 
      from "../services/problemServices.js"


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

const updateProblem = async (req, res) => {
  try {
    const result = await updateProblemService(req.params.id, req.body);

    res.json({
      message: "Problem updated successfully",
      data: result
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Problem.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Problem not found"
      });
    }

    res.json({
      message: "Problem deleted successfully"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message
    });
  }
};

export const getAllProblem = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await getAllProblemsService(page, limit);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getProblemById = async (req, res) => {
  try {
    const data = await getProblemByIdService(req.params.id);

    res.json({ data });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const solvedProblem = async (req, res) => {
  try {
    const data = await getSolvedProblemsService(req.user._id);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const submittedProblem = async (req, res) => {
  try {
    const data = await getSubmittedProblemsService(
      req.user._id,
      req.params.pid
    );

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { createProblem, updateProblem, deleteProblem }

