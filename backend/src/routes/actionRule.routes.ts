// Arquivo: backend/src/routes/actionRule.routes.ts
import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createActionRule } from '../controllers/actionRule.controller.js';

const router = Router();

// Rota para criar uma nova regra de ação (acesso de administrador será adicionado depois)
router.post('/', protect, createActionRule);

// Outras rotas de gerenciamento (GET, PUT, DELETE) podem ser adicionadas aqui no futuro.

export default router;
