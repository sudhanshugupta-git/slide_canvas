import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const updatePresentation = async (id, data) => {
  const res = await axios.patch(`${API}/presentations/${id}`, data);
  return res.data;
};

export const getAllPresentations = async () => {
  const res = await axios.get(`${API}/presentations`);
  return res.data;
};

export const createPresentation = async (title) => {
  const res = await axios.post(`${API}/presentations`, { title });
  return res.data;
};


export const deletePresentation = async (id) => {
  const res = await axios.delete(`${API}/presentations/${id}`);
  return res.data;
};