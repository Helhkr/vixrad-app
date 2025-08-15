import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cpf as cpfValidator } from 'cpf-cnpj-validator'; // Renomeado para evitar conflito
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '../utils/email.js';

const prisma = new PrismaClient();

/**
 * Registra um novo usuário no sistema.
 * Valida os dados de entrada, incluindo o CPF, verifica se o e-mail já existe,
 * hasheia a senha e cria o novo usuário no banco de dados.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, crm, crm_uf, cpf } = req.body;

    if (!name || !email || !password || !crm || !crm_uf || !cpf) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    
    const cpfLimpo = cpf.replace(/[^\d]/g, '');

    // if (!cpfValidator.isValid(cpfLimpo)) {
    //   return res.status(400).json({ message: 'Formato de CPF inválido.' });
    // }

    // TODO: Implementar validação de CRM com o serviço do CFM
    const isCrmValid = true; 
    if (!isCrmValid) {
      return res.status(400).json({ message: 'CRM inválido.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 3600000); 

    const newUser = await prisma.user.create({
      data: { 
        name, 
        email, 
        password_hash: hashedPassword, 
        crm, 
        crm_uf, 
        cpf: cpfLimpo,
        email_verification_token: emailVerificationToken, 
        email_verification_expires_at: verificationExpiresAt,
      },
    });

    await sendVerificationEmail(newUser.email, emailVerificationToken);

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error("JWT Secret não configurado.");
    }
    const token = jwt.sign(
      { userId: newUser.id, isAdmin: newUser.is_admin },
      secret,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.is_admin,
        is_email_verified: newUser.is_email_verified,
      },
    });

  } catch (error) {
    console.error("ERRO NO REGISTRO:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
  }
};

/**
 * Autentica um usuário existente.
 * Verifica as credenciais (e-mail e senha) e, se válidas,
 * retorna um JSON Web Token (JWT) para o cliente.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessTokenSecret || !refreshTokenSecret) {
      console.error("Variáveis de ambiente JWT não configuradas.");
      throw new Error("JWT Secrets não configurados.");
    }

    const accessToken = jwt.sign(
      { userId: user.id, isAdmin: user.is_admin },
      accessTokenSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      refreshTokenSecret,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
        is_email_verified: user.is_email_verified, // CORREÇÃO
      },
    });
  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
  }
};

/**
 * Verifica o e-mail do usuário usando o token de verificação.
 * Se o token for válido, atualiza o status de verificação do e-mail no banco de dados.
 */

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token inválido ou não fornecido.' });
    }

    const user = await prisma.user.findFirst({
      where: { email_verification_token: token },
    });

    // Se não encontrar o usuário OU se o token já expirou
    if (!user || !user.email_verification_expires_at || user.email_verification_expires_at < new Date()) {
      return res.status(404).json({ message: 'Seu token de verificação é inválido ou já expirou.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        is_email_verified: true,
        email_verification_token: null, // Limpa o token
        email_verification_expires_at: null, // Limpa a data de expiração
      },
    });

    // --- INÍCIO DA MODIFICAÇÃO: Login automático após verificação ---
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessTokenSecret || !refreshTokenSecret) {
      console.error("Variáveis de ambiente JWT não configuradas.");
      // Não jogue um erro aqui para não quebrar o fluxo para o usuário
      return res.status(500).json({ message: "Erro de configuração interna do servidor." });
    }

    const accessToken = jwt.sign(
      { userId: updatedUser.id, isAdmin: updatedUser.is_admin },
      accessTokenSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: updatedUser.id },
      refreshTokenSecret,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.status(200).json({
      message: 'E-mail verificado com sucesso!',
      accessToken,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.is_admin,
        is_email_verified: updatedUser.is_email_verified, // CORREÇÃO
      },
    });
    // --- FIM DA MODIFICAÇÃO ---

  } catch (error) {
    console.error("ERRO NA VERIFICAÇÃO DE EMAIL:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
  }
};

export const resendVerificationEmail = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId; // Obtido do token JWT pelo middleware 'protect'
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (user.is_email_verified) {
      return res.status(400).json({ message: 'Este e-mail já foi verificado.' });
    }

    // Lógica de tempo: impede o reenvio antes do token antigo expirar (se ele existir)
    if (user.email_verification_token && user.email_verification_expires_at && user.email_verification_expires_at > new Date()) {
      return res.status(400).json({ message: 'Aguarde o token anterior expirar antes de solicitar um novo.' });
    }

    // Gera novo token e data de expiração
    const newVerificationToken = randomBytes(32).toString('hex');
    const newExpiration = new Date(Date.now() + 3600000); // Mais 1 hora

    await prisma.user.update({
      where: { id: userId },
      data: {
        email_verification_token: newVerificationToken,
        email_verification_expires_at: newExpiration,
      },
    });

    await sendVerificationEmail(user.email, newVerificationToken);

    res.status(200).json({ message: 'Um novo e-mail de verificação foi enviado.' });
  } catch (error) {
    console.error("ERRO NO REENVIO DE EMAIL:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
  }
};

export const refresh = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token não encontrado.' });
  }

  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshTokenSecret) {
    throw new Error('JWT Refresh Secret não configurado.');
  }

  jwt.verify(refreshToken, refreshTokenSecret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Refresh token inválido.' });
    }

    const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessTokenSecret) {
      throw new Error('JWT Access Secret não configurado.');
    }

    const accessToken = jwt.sign(
      { userId: user.userId, isAdmin: user.isAdmin, is_email_verified: user.is_email_verified },
      accessTokenSecret,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout bem-sucedido.' });
};