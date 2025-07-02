import prisma from '../prisma.js';

export const addSlide = async (req, res) => {
  try{
    const presentation_id = Number(req.params.id);
    const { style, order } = req.body;
    const slide = await prisma.slide.create({
      data: { presentation_id, style, order }
    });
    res.json(slide);
  }catch(error){
    res.status(500).json({ error: error.message });
  }
};

// export const updateSlide = async (req, res) => {
//   try{
//     const id = Number(req.params.id);
//     const { style, order } = req.body;
//     const slide = await prisma.slide.update({
//       where: { id },
//       data: { style, order }
//     });
//     res.json(slide);
//   }catch(error){
//     res.status(500).json({ error: error.message });
//   }
// };

export const updateSlideByOrder = async (req, res) => {
  try {
    const { presentationId, order } = req.params;
    const { style } = req.body;
    const slide = await prisma.slide.findFirst({
      where: {
        presentation_id: Number(presentationId),
        order: Number(order),
      },
    });
    if (!slide) {
      return res.status(404).json({ error: "Slide not found" });
    }
    const updated = await prisma.slide.update({
      where: { id: slide.id },
      data: { style },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const deleteSlide = async (req, res) => {
//   try{
//     const id = Number(req.params.id);
//     // First, delete all elements belonging to this slide
//     await prisma.element.deleteMany({ where: { slide_id: id } });

//     // Then, delete the slide itself
//     await prisma.slide.delete({ where: { id } });
//     res.json({ success: true });
//   }catch(error){
//     res.status(500).json({ error: error.message });
//   }
// };

export const deleteSlideByOrder = async (req, res) => {
  try {
    const { presentationId, order } = req.params;
    // Find the slide by presentation_id and order
    const slide = await prisma.slide.findFirst({
      where: {
        presentation_id: Number(presentationId),
        order: Number(order),
      },
    });
    if (!slide) {
      return res.status(404).json({ error: "Slide not found" });
    }
    // Delete all elements of this slide
    await prisma.element.deleteMany({ where: { slide_id: slide.id } });
    // Delete the slide itself
    await prisma.slide.delete({ where: { id: slide.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};