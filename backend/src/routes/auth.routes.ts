console.log('  3. Iniciando auth.routes.ts...');

import express from 'express';
import * as AuthController from '../controllers/auth.controller.ts';
import { protect } from '../middlewares/auth.middleware.ts';

console.log('  4. Imports do auth.routes.ts concluídos.'); // Adicione após os imports

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// A função 'protect' roda primeiro. Se o token for válido, ela passa para a próxima função.
router.get('/profile', protect, (req: any, res) => {
  res.status(200).json({
    message: 'Acesso a rota protegida foi um sucesso!',
    user: req.user 
  });
});

export default router;