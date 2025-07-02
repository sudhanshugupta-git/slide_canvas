import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const updatePresentation = async (id, data) => {
  const res = await axios.patch(`${API}/presentations/${id}`, data);
  return res.data;
};