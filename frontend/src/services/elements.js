import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// Add a new element to a slide
export const addElement = async (slideId, data) => {
  const res = await axios.post(`${API}/slides/${slideId}/elements`, data);
  return res.data;
};

// Update an element by ID
export const updateElement = async (elementId, data) => {
  const res = await axios.patch(`${API}/elements/${elementId}`, data);
  return res.data;
};

// Delete an element by ID
export const deleteElement = async (elementId) => {
  const res = await axios.delete(`${API}/elements/${elementId}`);
  return res.data;
};