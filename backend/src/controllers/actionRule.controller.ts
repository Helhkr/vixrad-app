// Arquivo: backend/src/controllers/actionRule.controller.ts
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cria uma nova regra de ação para um template.
 * Exemplo de corpo da requisição:
 * {
 *   "templateId": "uuid-do-template",
 *   "sourceActionId": "colelitiase_unica_click",
 *   "targetSectionId": "uuid-da-secao-impressao",
 *   "actionText": "Colecistolitíase."
 * }
 */
export const createActionRule = async (req: any, res: Response) => {
  // TODO: Adicionar verificação de administrador (req.user.isAdmin)
  
  try {
    const { templateId, sourceActionId, targetSectionId, action_text_on_activate, action_text_on_deactivate } = req.body;

    if (!templateId || !sourceActionId || !targetSectionId || action_text_on_activate === undefined) {
      return res.status(400).json({ message: 'Campos obrigatórios: templateId, sourceActionId, targetSectionId, action_text_on_activate.' });
    }

    const newRule = await prisma.actionRule.create({
      data: {
        template_id: templateId,
        source_action_id: sourceActionId,
        target_section_id: targetSectionId,
        action_text_on_activate: action_text_on_activate,
        action_text_on_deactivate: action_text_on_deactivate || null,
      },
    });

    res.status(201).json(newRule);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'sourceActionId já existe para este template. Por favor, use um ID único.' });
    }
    console.error("Erro ao criar a regra de ação:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar a regra.' });
  }
};

/**
 * Atualiza uma regra de ação existente pelo seu ID.
 */
export const updateActionRule = async (req: any, res: Response) => {
  // TODO: Adicionar verificação de administrador (req.user.isAdmin)
  try {
    const { id } = req.params; // Use 'id' from params as primary key
    const { sourceActionId, targetSectionId, action_text_on_activate, action_text_on_deactivate } = req.body;

    if (!sourceActionId || !targetSectionId || action_text_on_activate === undefined) {
      return res.status(400).json({ message: 'Campos obrigatórios: sourceActionId, targetSectionId, action_text_on_activate.' });
    }

    const updatedRule = await prisma.actionRule.update({
      where: { id: id }, // Update by primary key 'id'
      data: {
        source_action_id: sourceActionId,
        target_section_id: targetSectionId,
        action_text_on_activate: action_text_on_activate,
        action_text_on_deactivate: action_text_on_deactivate || null,
      },
    });
    res.status(200).json(updatedRule);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'sourceActionId já existe para este template. Por favor, use um ID único.' });
    }
    console.error("Erro ao atualizar a regra de ação:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar a regra.' });
  }
};

/**
 * Deleta uma regra de ação existente pelo seu ID.
 */
export const deleteActionRule = async (req: any, res: Response) => {
  // TODO: Adicionar verificação de administrador (req.user.isAdmin)
  try {
    const { id } = req.params; // Use 'id' from params as primary key
    await prisma.actionRule.delete({
      where: { id: id },
    });
    res.status(204).send(); // No Content
  } catch (error) {
    console.error("Erro ao deletar a regra de ação:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar a regra.' });
  }
};

/**
 * Busca uma regra de ação específica por templateId e sourceActionId.
 */
export const getActionRuleByTemplateAndSourceActionId = async (req: Request, res: Response) => {
  try {
    const { templateId, sourceActionId } = req.query;

    if (!templateId || !sourceActionId) {
      return res.status(400).json({ message: 'templateId e sourceActionId são obrigatórios.' });
    }

    const actionRules = await prisma.actionRule.findMany({
      where: {
        template_id: templateId as string,
        source_action_id: sourceActionId as string,
      },
    });

    res.status(200).json(actionRules);
  } catch (error) {
    console.error("Erro ao buscar regra de ação:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar a regra.' });
  }
};
