import axios from "axios"

const wait = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

export const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions,
    },
  };

  try {
    const response = await axios.request(options);

    return response.data; 
  } catch (error) {
    console.error("Error in submitBatch:", error.message);
    throw error;
  }
};

export const submitToken = async (resultToken) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: resultToken.join(","),
      base64_encoded: "false",
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


