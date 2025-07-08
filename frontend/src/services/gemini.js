import axios from "axios";
const API = import.meta.env.VITE_API_URL;

export const generateSlidesWithGemini = async (prompt) => {
  const res = await axios.post(`${API}/gemini/generate`, { prompt });
  return res.data;
};