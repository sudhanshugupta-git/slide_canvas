import prisma from "../prisma.js";

export const getPresentation = async (req, res) => {
  try {
    const presentation = await prisma.presentation.findMany();
    res.json(presentation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPresentation = async (req, res) => {
  try {
    const { title } = req.body;
    const presentation = await prisma.presentation.create({
      data: { title },
    });
    res.json(presentation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePresentation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title } = req.body;
    const updated = await prisma.presentation.update({
      where: { id },
      data: { title },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deletePresentation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    const slides = await prisma.slide.findMany({ where: { presentation_id: id } });
    // Delete all elements
    for (const slide of slides) {
      await prisma.element.deleteMany({ where: { slide_id: slide.id } });
    }

    // Delete all slides
    await prisma.slide.deleteMany({ where: { presentation_id: id } });
    
    // Finally delete the presentation
    await prisma.presentation.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};