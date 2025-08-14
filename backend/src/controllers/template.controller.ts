// Arquivo: src/controllers/template.controller.ts

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- FUNÇÕES CRUD ATUALIZADAS PARA O NOVO SCHEMA ---

/**
 * Cria um novo Template com suas Seções e Subseções aninhadas.
 */
export const createTemplate = async (req: Request, res: Response) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  try {
    const { name, modality, specialty, sections } = req.body;

    if (!name || !modality || !specialty || !sections) {
      return res.status(400).json({ message: 'Dados inválidos. Campos obrigatórios: name, modality, specialty, sections.' });
    }

    // A mágica do Prisma: "escrita aninhada" através de 3 níveis.
    const newTemplate = await prisma.template.create({
      data: {
        name,
        modality,
        specialty,
        authorId: req.user.userId,
        sections: {
          create: sections.map((section: any) => ({
            title: section.title,
            display_order: section.display_order,
            subsections: {
              create: section.subsections.map((subsection: any) => ({
                title: subsection.title,
                display_order: subsection.display_order,
                content: subsection.content || {}, // Garante que o JSON não seja nulo
              })),
            },
          })),
        },
      },
      // Incluímos todos os dados criados na resposta para confirmação
      include: {
        sections: {
          include: {
            subsections: true,
          },
        },
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
      // Para a lista principal, só precisamos dos dados de alto nível
      select: {
        id: true,
        name: true,
        modality: true,
        specialty: true,
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