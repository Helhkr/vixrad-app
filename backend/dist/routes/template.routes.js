// Arquivo: src/routes/template.routes.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createTemplate, getAllTemplates, getTemplateById, updateTemplate, deleteTemplate, addSectionToTemplate, addSubsectionToSection, addDynamicOptionSetToSubsection, // New import
addInteractiveElementToDynamicOptionSet, // Renamed import
updateSection, deleteSection, updateSubsection, deleteSubsection, updateInteractiveElement, deleteInteractiveElement, updateDynamicOptionSet, // New import
deleteDynamicOptionSet // New import
 } from '../controllers/template.controller.js';
const router = Router();
router.post('/', protect, createTemplate);
router.get('/', protect, getAllTemplates);
router.get('/:id', protect, getTemplateById);
// Section routes
router.post('/:templateId/sections', protect, addSectionToTemplate);
router.put('/sections/:sectionId', protect, updateSection);
router.delete('/sections/:sectionId', protect, deleteSection);
// Subsection routes
router.post('/sections/:sectionId/subsections', protect, addSubsectionToSection);
router.put('/subsections/:subsectionId', protect, updateSubsection);
router.delete('/subsections/:subsectionId', protect, deleteSubsection);
// Dynamic Option Set routes
router.post('/subsections/:subsectionId/dynamic-option-sets', protect, addDynamicOptionSetToSubsection);
router.put('/dynamic-option-sets/:id', protect, updateDynamicOptionSet);
router.delete('/dynamic-option-sets/:id', protect, deleteDynamicOptionSet);
// Interactive Element routes
router.post('/dynamic-option-sets/:dynamicOptionSetId/elements', protect, addInteractiveElementToDynamicOptionSet);
router.put('/elements/:elementId', protect, updateInteractiveElement);
router.delete('/elements/:elementId', protect, deleteInteractiveElement);
router.put('/:id', protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);
export default router;
