import prisma from '../prisma.js';

export const getPresentation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const presentation = await prisma.presentation.findUnique({
      where: { id },
      include: {
        slides: {
          orderBy: { order: "asc" },
          include: { elements: { orderBy: { order: "asc" } } },
        },
      },
    });
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
