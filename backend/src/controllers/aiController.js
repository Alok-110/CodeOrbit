import Groq from "groq-sdk"
import Problem from "../models/problemModel.js"
import Submission from "../models/submissionModel.js"


export const handleAIQuery = async (req, res) => {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
        const userId = req.user.id
        const { problemId, code, message, language } = req.body

    if (!problemId || !code) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const problem = await Problem.findById(problemId)
    if (!problem) return res.status(404).json({ error: "Problem not found" })

    const submission = await Submission.findOne({ userId, problemId }).sort({ createdAt: -1 })

    let failureContext = ""
    if (submission && submission.failedTestCases?.length > 0) {
      const fail = submission.failedTestCases[0]
      failureContext = `
        Failed Test Case:
        Input: ${fail.input}
        Expected Output: ${fail.expected}
        Your Output: ${fail.output}
      `
    }

    const prompt = `
You are a DSA tutor. Be concise and structured.

Problem: ${problem.title} (${problem.difficulty || ""})
${problem.description?.slice(0, 300)}...

User's ${language || "code"}:
\`\`\`
${code?.slice(0, 800)}
\`\`\`

${failureContext ? `Last failure:\n${failureContext}` : ""}

Question: ${message || "Help me debug"}

Rules:
- Max 150 words
- No full solutions unless asked
- Point to exact issue if visible
`

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    })

    const text = completion.choices[0]?.message?.content
    res.json({ reply: text })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// import "dotenv/config" 
// import { GoogleGenerativeAI } from "@google/generative-ai"
// import Problem from "../models/problemModel.js"
// import Submission from "../models/submissionModel.js"

// console.log("KEY:", process.env.GEMINI_API_KEY?.slice(0, 8))
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)


// export const handleAIQuery = async (req, res) => {
//   try {
//     const userId = req.user.id
//     const { problemId, code, message, language } = req.body

//     if (!problemId || !code) {
//       return res.status(400).json({ error: "Missing required fields" })
//     }

//     const problem = await Problem.findById(problemId)
//     if (!problem) return res.status(404).json({ error: "Problem not found" })

//     const submission = await Submission.findOne({ userId, problemId }).sort({ createdAt: -1 })

//     let failureContext = ""
//     if (submission && submission.failedTestCases?.length > 0) {
//       const fail = submission.failedTestCases[0]
//       failureContext = `
//         Failed Test Case:
//         Input: ${fail.input}
//         Expected Output: ${fail.expected}
//         Your Output: ${fail.output}
//       `
//     }

//     const prompt = `
//         You are a DSA tutor. Be concise and structured.

//         Problem: ${problem.title} (${problem.difficulty || ""})
//         ${problem.description?.slice(0, 300)}...

//         User's ${language || "code"}:
//         \`\`\`
//         ${code?.slice(0, 800)}
//         \`\`\`

//         ${failureContext ? `Last failure:\n${failureContext}` : ""}

//         Question: ${message || "Help me debug"}

//         Rules:
//         - Max 150 words
//         - No full solutions unless asked
//         - Point to exact issue if visible
//         `

//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
//     const result = await model.generateContent(prompt)
//     const text = result.response.text()

//     res.json({ reply: text })

//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ error: "Internal server error" })
//   }
// }