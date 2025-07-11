import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// Add a new slide to a presentation
export const addSlide = async (presentationId, data) => {
  const res = await axios.post(`${API}/presentations/${presentationId}/slides`, data);
  return res.data;
};

// export const updateSlide = async (presentationId, order) => {
//   const res = await axios.patch(
//     `${API}/slides/presentation/${presentationId}`,
//     { order }
//   );
//   return res.data;
// };

// Update a slide by ID
export const updateSlideByOrder = async (presentationId, order, style) => {
  const res = await axios.patch(
    `${API}/slides/presentation/${presentationId}/order/${order}`,
    { style }
  );
  return res.data;
};


export const getSlides = async (presentationId) => {
  const res = await axios.get(`${API}/slides/presentation/${presentationId}/`);
  return res.data;
};


export const getFirstSlide = async (presentationId) => {
  const res = await axios.get(`${API}/slides/presentation/${presentationId}/first`);
  return res.data;
};

// Delete a slide by ID
export const deleteSlideByOrder = async (presentationId, order) => {
  const res = await axios.delete(
    `${API}/slides/presentation/${presentationId}/order/${order}`
  );
  return res.data;
};

