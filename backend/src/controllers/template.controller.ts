// Arquivo: src/controllers/template.controller.ts

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- FUNÇÕES CRUD ATUALIZADAS PARA O NOVO SCHEMA ---

/**
 * Cria um novo Template com suas Seções.
 */
export const createTemplate = async (req: any, res: Response) => {
  // A verificação de admin está comentada para fins de teste
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ message: 'Acesso negado.' });
  // }

  try {
    const { name, category_id, sections } = req.body;

    if (!name || !sections || !Array.isArray(sections)) {
      return res.status(400).json({ message: 'Dados inválidos. Campos obrigatórios: name, sections (array).' });
    }

    const newTemplate = await prisma.template.create({
      data: {
        name,
        created_by_id: req.user.userId,
        category_id: category_id || null,
        sections: {
          create: sections.map((section: any) => ({
            title: section.title,
            default_text: section.default_text || '',
            display_order: section.display_order,
            content: section.content || undefined, // Opcional
          })),
        },
      },
      include: {
        sections: true, // Inclui as seções criadas na resposta
      },
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    console.error("Erro ao criar o template:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar o template.' });
  }
};

/**
 * Busca todos os Templates (visão simplificada para a lista).
 */
export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(200).json(templates);
  } catch (error) {
    console.error("Erro ao buscar os templates:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar os templates.' });
  }
};

/**
 * Busca um Template específico com todas as suas Seções e Subseções.
 */
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Consulta aninhada para trazer toda a hierarquia de dados
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { display_order: 'asc' },
          include: {
            subsections: {
              orderBy: { display_order: 'asc' },
            },
          },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado.' });
    }

    res.status(200).json(template);
  } catch (error) {
    console.error(`Erro ao buscar o template com ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar o template.' });
  }
};

/**
 * ATUALIZA um Template. (Funcionalidade a ser implementada)
 */
export const updateTemplate = async (req: Request, res: Response) => {
  // O código 501 significa "Not Implemented" (Não Implementado)
  res.status(501).json({ message: 'Funcionalidade de atualizar ainda não implementada.' });
};

/**
 * DELETA um Template. (Funcionalidade a ser implementada)
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Funcionalidade de deletar ainda não implementada.' });
};