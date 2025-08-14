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
    const { templateId, sourceActionId, targetSectionId, actionText } = req.body;

    if (!templateId || !sourceActionId || !targetSectionId || actionText === undefined) {
      return res.status(400).json({ message: 'Campos obrigatórios: templateId, sourceActionId, targetSectionId, actionText.' });
    }

    const newRule = await prisma.actionRule.create({
      data: {
        template_id: templateId,
        source_action_id: sourceActionId,
        target_section_id: targetSectionId,
        action_text: actionText,
      },
    });

    res.status(201).json(newRule);
  } catch (error) {
    console.error("Erro ao criar a regra de ação:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar a regra.' });
  }
};
