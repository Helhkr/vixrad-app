// Arquivo: backend/src/routes/actionRule.routes.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createActionRule, updateActionRule, deleteActionRule, getActionRuleByTemplateAndSourceActionId } from '../controllers/actionRule.controller.js';
const router = Router();
// Rota para criar uma nova regra de ação (acesso de administrador será adicionado depois)
router.post('/', protect, createActionRule);
// Rotas para atualizar e deletar regras de ação
router.put('/:id', protect, updateActionRule);
router.delete('/:id', protect, deleteActionRule);
// Rota para buscar uma regra de ação por templateId e sourceActionId
router.get('/', protect, getActionRuleByTemplateAndSourceActionId);
// Outras rotas de gerenciamento (GET, PUT, DELETE) podem ser adicionadas aqui no futuro.
export default router;
