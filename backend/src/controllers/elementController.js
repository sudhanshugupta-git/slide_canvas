import prisma from '../prisma.js';

export const addElement = async (req, res) => {
  try{
    const slide_id = Number(req.params.slideId);
    const { type, content, src, width, height, position, style, order } = req.body;
    const element = await prisma.element.create({
      data: { slide_id, type, content, src, width, height, position, style, order }
    });
    res.json(element);
  }catch(error){
    res.status(500).json({ error: error.message });
  }
};

export const updateElement = async (req, res) => {
  try{
    const id = Number(req.params.id);
    const { content, src, width, height, position, style, order } = req.body;
    const element = await prisma.element.update({
      where: { id },
      data: { content, src, width, height, position, style, order }
    });
    res.json(element);
  }catch(error){
    res.status(500).json({ error: error.message });
  }
};

export const deleteElement = async (req, res) => {
  try{
    const id = Number(req.params.id);
    await prisma.element.delete({ where: { id } });
    res.json({ success: true });
  }catch(error){
    res.status(500).json({ error: error.message });
  }
};