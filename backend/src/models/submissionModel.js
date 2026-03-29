import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ["javascript", "c++", "java", "python"]
  },
  status: {
    type: String,
    enum: ["pending", "Accepted", "wrong", "error"],
    default: "pending"
  },
  runtime: {
    type: Number,
    default: 0
  },
  memory: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: ""
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// index
submissionSchema.index({ userId: 1, problemId: 1 });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;