export const getLanguageById = (language) => {
  const key = language.toLowerCase().trim();

  const languageMap = {
    "cpp": 54,
    "c++": 54,
    "python": 71,
    "py": 71,
    "java": 62,
    "javascript": 63,
    "js": 63
  };

  const id = languageMap[key];

  if (!id) {
    console.log("Unsupported language received:", language);
    throw new Error("Unsupported language");
  }

  return id;
};