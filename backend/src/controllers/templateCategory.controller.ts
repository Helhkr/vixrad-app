import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTemplateCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const templateCategory = await prisma.templateCategory.create({
      data: { name },
    });
    res.status(201).json(templateCategory);
  } catch (error) {
    console.error('Error creating template category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllTemplateCategories = async (req: Request, res: Response) => {
  try {
    const templateCategories = await prisma.templateCategory.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(templateCategories);
  } catch (error) {
    console.error('Error fetching template categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTemplateCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const templateCategory = await prisma.templateCategory.findUnique({
      where: { id },
    });
    if (!templateCategory) {
      return res.status(404).json({ message: 'Template category not found' });
    }
    res.status(200).json(templateCategory);
  } catch (error) {
    console.error('Error fetching template category by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTemplateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const templateCategory = await prisma.templateCategory.update({
      where: { id },
      data: { name },
    });
    res.status(200).json(templateCategory);
  } catch (error) {
    console.error('Error updating template category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTemplateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.templateCategory.delete({
      where: { id },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting template category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
