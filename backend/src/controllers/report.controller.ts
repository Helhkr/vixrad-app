// Arquivo: backend/src/controllers/report.controller.ts
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cria um novo laudo (Report) a partir de um template existente.
 */
export const createReport = async (req: any, res: Response) => {
  const { templateId } = req.body;
  const userId = req.user.userId; // Obtido do token JWT pelo middleware 'protect'

  if (!templateId) {
    return res.status(400).json({ message: 'O ID do template é obrigatório.' });
  }

  try {
    // 1. Verificar se o template existe e buscar suas seções
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { sections: true },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template não encontrado.' });
    }

    // 2. Criar o novo laudo (Report)
    const newReport = await prisma.report.create({
      data: {
        user_id: userId,
        template_id: templateId,
        status: 'draft',
      },
    });

    // 3. Criar as entradas em ReportData para cada seção do template
    if (template.sections && template.sections.length > 0) {
      const reportDataCreation = template.sections.map((section) => {
        return prisma.reportData.create({
          data: {
            report_id: newReport.id,
            section_id: section.id,
            // O conteúdo inicial é o texto padrão da seção
            content: section.default_text || '', 
          },
        });
      });
      // Executa todas as criações de ReportData em uma transação
      await prisma.$transaction(reportDataCreation);
    }

    // 4. Retornar o laudo recém-criado
    res.status(201).json(newReport);

  } catch (error) {
    console.error("Erro ao criar o laudo:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno ao criar o laudo.' });
  }
};

/**
 * Busca um laudo específico pelo seu ID, incluindo os dados das seções.
 */
export const getReport = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        // Inclui os dados do usuário para verificação de permissão
        user: true,
        // Inclui o template base para referência
        template: {
          include: {
            sections: {
              orderBy: {
                display_order: 'asc',
              },
              include: {
                subsections: {
                  orderBy: {
                    display_order: 'asc',
                  },
                  include: {
                    dynamicOptionSets: {
                      orderBy: {
                        display_order: 'asc',
                      },
                      include: {
                        elements: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // Inclui o conteúdo específico deste laudo
        reportData: {
          include: {
            section: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ message: 'Laudo não encontrado.' });
    }

    // Verificação de segurança: garante que o usuário só possa ver seus próprios laudos
    if (report.user_id !== userId) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    res.status(200).json(report);

  } catch (error) {
    console.error("Erro ao buscar o laudo:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno ao buscar o laudo.' });
  }
};

/**
 * Atualiza o conteúdo de uma seção específica de um laudo.
 */
export const updateReportData = async (req: any, res: Response) => {
  const { reportId } = req.params;
  const { sectionId, content } = req.body;
  const userId = req.user.userId;

  if (!sectionId || content === undefined) {
    return res.status(400).json({ message: 'O ID da seção e o conteúdo são obrigatórios.' });
  }

  try {
    // 1. Verificar se o laudo existe e se pertence ao usuário
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ message: 'Laudo não encontrado.' });
    }
    if (report.user_id !== userId) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 2. Atualizar o ReportData correspondente
    const updatedData = await prisma.reportData.update({
      where: {
        report_id_section_id: {
          report_id: reportId,
          section_id: sectionId,
        },
      },
      data: {
        content,
      },
    });

    res.status(200).json(updatedData);

  } catch (error) {
    console.error("Erro ao atualizar os dados do laudo:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno ao salvar os dados.' });
  }
};

/**
 * Avalia uma ação do editor e retorna as atualizações de texto correspondentes.
 */
export const evaluateAction = async (req: any, res: Response) => {
  const { templateId, sourceActionId, isActive } = req.body; // Adicionado isActive

  if (!templateId || !sourceActionId || typeof isActive !== 'boolean') { // Validar isActive
    return res.status(400).json({ message: 'Os IDs do template, da ação de origem e o estado de ativação são obrigatórios.' });
  }

  try {
    const rules = await prisma.actionRule.findMany({
      where: {
        template_id: templateId,
        source_action_id: sourceActionId,
      },
    });

    // Mapeia as regras para o formato de resposta esperado pelo frontend
    const updates = rules.map(rule => ({
      targetSectionId: rule.target_section_id,
      // Usa o texto de ativação ou desativação com base no estado isActive
      actionText: (isActive ? rule.action_text_on_activate : (rule.action_text_on_deactivate || '')).trim(),
    }));

    res.status(200).json({ updates });

  } catch (error) {
    console.error("Erro ao avaliar a ação:", error);
    res.status(500).json({ message: 'Ocorreu um erro interno ao avaliar a ação.' });
  }
};




