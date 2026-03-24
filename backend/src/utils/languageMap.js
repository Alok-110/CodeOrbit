const languageMap = {
  "cpp": 54,
  "python": 71,
  "java": 62,
  "javascript": 63
};

export const getLanguageById = (language) => {
  const id = languageMap[language.toLowerCase().trim()];

  if (!id) {
    throw new Error("Unsupported language");
  }

  return id;
};
