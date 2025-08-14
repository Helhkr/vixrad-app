// Arquivo: src/routes/template.routes.ts

import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.ts';
import { 
    createTemplate, 
    getAllTemplates, 
    getTemplateById, 
    updateTemplate, 
    deleteTemplate} from '../controllers/template.controller.ts';

const router = Router();

router.post('/', protect, createTemplate);
router.get('/', protect, getAllTemplates);
router.get('/:id', protect, getTemplateById);
router.put('/:id', protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);

export default router;