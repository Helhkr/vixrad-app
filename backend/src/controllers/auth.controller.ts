import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cpf } from 'cpf-cnpj-validator';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, crm, crm_uf, user_cpf } = req.body;
    if (!cpf.isValid(user_cpf)) {
      return res.status(400).json({ message: 'CPF inválido.' });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está em uso.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password_hash: hashedPassword, crm, crm_uf, cpf: user_cpf },
    });
    res.status(201).json({ message: 'Usuário criado com sucesso!', userId: newUser.id });
  } catch (error) {
    console.error("ERRO NO REGISTRO:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
  }
};

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
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT Secret não configurado.");
    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, secret, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
  }
};