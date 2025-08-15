import { Router } from 'express';
import {
  createTemplateCategory,
  getAllTemplateCategories,
  getTemplateCategoryById,
  updateTemplateCategory,
  deleteTemplateCategory,
} from '../controllers/templateCategory.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', protect, createTemplateCategory);
router.get('/', protect, getAllTemplateCategories);
router.get('/:id', protect, getTemplateCategoryById);
router.put('/:id', protect, updateTemplateCategory);
router.delete('/:id', protect, deleteTemplateCategory);

export default router;
