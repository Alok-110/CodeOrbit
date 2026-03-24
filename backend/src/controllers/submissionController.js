import { runCodeService } from "../services/runCodeServices.js";
import { submitCodeService } from "../services/submissionServices.js";


export const submitCode = async (req, res) => {
  try {
    const result = await submitCodeService(
      req.user._id,
      req.params.id,
      req.body.code,
      req.body.language
    );

    res.status(201).json({
      message: "Submitted",
      data: result
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const runCode = async (req, res) => {
  try {
    const result = await runCodeService(
      req.params.id,
      req.body.code,
      req.body.language
    );

    res.json({ data: result });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};