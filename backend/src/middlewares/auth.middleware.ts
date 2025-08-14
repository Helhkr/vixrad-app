console.log('    5. Iniciando auth.middleware.ts...');

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Nenhum token, autorização negada.' });
    }

    const token = authorization.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    // Estrutura IF/ELSE para isolar completamente o escopo
    if (typeof secret === 'string') {
      // DENTRO DESTE BLOCO, 'secret' É INEGAVELMENTE UMA STRING

      const decodedPayload = jwt.verify(token, secret);

      if (typeof decodedPayload !== 'object' || !('userId' in decodedPayload)) {
        return res.status(401).json({ message: 'Token com formato inválido.' });
      }

      req.user = {
        userId: decodedPayload.userId,
        isAdmin: (decodedPayload as any).isAdmin || false
      };
      
      // Se tudo deu certo, passamos para a próxima rota
      return next();

    } else {
      // Se 'secret' não for uma string, caímos aqui
      console.error('FATAL: A variável de ambiente JWT_SECRET não foi configurada.');
      return res.status(500).json({ message: 'Erro de configuração interna do servidor.' });
    }

  } catch (error) {
    console.error('ERRO NA VERIFICAÇÃO DO TOKEN:', error);
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};