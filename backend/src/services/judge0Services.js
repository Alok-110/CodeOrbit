import axios from "axios"

const wait = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

// safely encode any string to base64 (handles unicode)
const toBase64 = (str) => {
  if (!str) return str
  return Buffer.from(str, "utf-8").toString("base64")
}

export const submitBatch = async (submissions) => {
  const encoded = submissions.map(s => ({
    ...s,
    source_code:     toBase64(s.source_code),
    stdin:           toBase64(s.stdin),
    expected_output: toBase64(s.expected_output),
  }))

  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "true",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions: encoded,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error in submitBatch:", error.message);
    console.error("judge0 response:", error.response?.data);
    throw error;
  }
};

export const submitToken = async (resultToken) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: resultToken.join(","),
      base64_encoded: "true",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  while (true) {
    try {
      const response = await axios.request(options);
      const result = response.data;

      const isObtained = result.submissions.every((r) => r.status_id > 2);

      if (isObtained) {
        return result;
      }

      await wait(1000);
    } catch (error) {
      console.error("Error in submitToken:", error.message);
      console.error("judge0 response:", error.response?.data);
      throw error;
    }
  }
};

export const runBatch = async (submissions) => {
  const submitRes = await submitBatch(submissions);
  const tokens = submitRes.map((s) => s.token);
  const { submissions: results } = await submitToken(tokens);
  return results;
};
