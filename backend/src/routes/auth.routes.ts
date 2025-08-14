import { Router } from 'express';

// Adicione a extensão .js no final dos caminhos dos arquivos locais
import { register, login, verifyEmail, resendVerificationEmail, refresh, logout } from '../controllers/auth.controller.js';
import { protect, fetchUserStatus } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', protect, resendVerificationEmail);

// Rota de exemplo para testar a proteção
router.get('/profile', protect, (req: any, res) => {
  // Graças ao middleware 'protect', o req.user estará disponível aqui
  res.status(200).json({
    message: 'Acesso à rota protegida bem-sucedido!',
    user: req.user,
  });
});

router.get('/status', protect, fetchUserStatus, (req: any, res) => {
    res.status(200).json({ user: req.user });
});

export default router;