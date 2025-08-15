console.log('    5. Iniciando auth.middleware.ts...');
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const protect = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Nenhum token, autorização negada.' });
        }
        const token = authorization.split(' ')[1];
        const secret = process.env.JWT_ACCESS_SECRET;
        if (typeof secret === 'string') {
            // Cast decodedPayload to our JwtPayload interface
            const decodedPayload = jwt.verify(token, secret);
            if (typeof decodedPayload !== 'object' || !('userId' in decodedPayload)) {
                return res.status(401).json({ message: 'Token com formato inválido.' });
            }
            // Assign the decoded payload directly to req.user
            // Ensure all properties expected by Express.Request.user are present
            req.user = {
                userId: decodedPayload.userId,
                isAdmin: decodedPayload.isAdmin || false,
                is_email_verified: decodedPayload.is_email_verified || false
            };
            return next();
        }
        else {
            console.error('FATAL: A variável de ambiente JWT_SECRET não foi configurada.');
            return res.status(500).json({ message: 'Erro de configuração interna do servidor.' });
        }
    }
    catch (error) {
        console.error('ERRO NA VERIFICAÇÃO DO TOKEN:', error);
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.isAdmin) { // Simplificado para verificar apenas isAdmin
            return res.status(403).json({ message: 'Acesso negado: Você não tem permissão para realizar esta ação.' });
        }
        next();
    };
};
// Middleware para buscar o status do usuário e anexar ao req.user
export const fetchUserStatus = async (req, res, next) => {
    try {
        // Certifique-se de que req.user.userId está disponível (do middleware 'protect')
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                is_admin: true,
                is_email_verified: true, // Garante que este campo seja selecionado
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        // Anexa o objeto user completo (com is_email_verified) ao req.user
        req.user = { ...req.user, ...user };
        next();
    }
    catch (error) {
        console.error('Erro ao buscar status do usuário:', error);
        res.status(500).json({ message: 'Erro interno ao buscar status do usuário.' });
    }
};
// Middleware para verificar se o e-mail do usuário está verificado
export const checkEmailVerified = (req, res, next) => {
    // Este middleware deve ser usado APÓS 'fetchUserStatus'
    if (!req.user || !req.user.is_email_verified) {
        return res.status(403).json({ message: 'E-mail não verificado. Por favor, verifique seu e-mail para acessar este recurso.' });
    }
    next();
};
