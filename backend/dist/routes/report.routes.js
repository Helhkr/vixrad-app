// Arquivo: backend/src/routes/report.routes.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
// Importaremos os controladores à medida que os criarmos
import { createReport, getReport, updateReportData, evaluateAction } from '../controllers/report.controller.js';
const router = Router();
// Rota para criar um novo laudo a partir de um template
router.post('/', protect, createReport);
// Rota para buscar os dados de um laudo específico
router.get('/:id', protect, getReport);
// Rota para salvar/atualizar o conteúdo de uma seção do laudo
router.put('/:reportId/data', protect, updateReportData);
// Rota para avaliar uma ação dinâmica do editor
router.post('/evaluate-action', protect, evaluateAction);
export default router;
