// Arquivo: src/controllers/template.controller.ts

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
    const { name, category_id, sections, report_title, report_title_alignment, report_title_uppercase, report_title_bold } = req.body;

    if (!name || !sections || !Array.isArray(sections)) {
      return res.status(400).json({ message: 'Dados inválidos. Campos obrigatórios: name, sections (array).' });
    }

    const newTemplate = await prisma.template.create({
      data: {
        name,
        created_by_id: req.user.userId,
        category_id: category_id || null,
        report_title: report_title || null,
        report_title_alignment: report_title_alignment || 'center',
        report_title_uppercase: report_title_uppercase !== undefined ? report_title_uppercase : true,
        report_title_bold: report_title_bold !== undefined ? report_title_bold : true,
        sections: {
          create: sections.map((section: any) => ({
            title: section.title,
            default_text: section.default_text || '',
            display_order: section.display_order,
            subsections: {
              create: section.subsections?.map((subsection: any) => ({
                title: subsection.title,
                display_order: subsection.display_order,
                dynamicOptionSets: {
                  create: subsection.dynamicOptionSets?.map((dynamicOptionSet: any) => ({
                    title: dynamicOptionSet.title,
                    display_order: dynamicOptionSet.display_order,
                    elements: {
                      create: dynamicOptionSet.elements?.map((element: any) => ({
                        source_action_id: element.source_action_id,
                        type: element.type,
                        label: element.label,
                        default_value: element.default_value || null,
                        is_default_selected: element.is_default_selected || false,
                      })),
                    },
                  })),
                },
              })),
            },
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
 * Adiciona uma nova seção a um Template existente.
 */
export const addSectionToTemplate = async (req: any, res: Response) => {
  // A verificação de admin está comentada para fins de teste
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ message: 'Acesso negado.' });
  // }

  try {
    const { templateId } = req.params;
    const { title, default_text, display_order } = req.body;

    if (!title || display_order === undefined) {
      return res.status(400).json({ message: 'Título e Ordem de Exibição são obrigatórios.' });
    }

    const newSection = await prisma.templateSection.create({
      data: {
        template_id: templateId,
        title,
        default_text: default_text || '',
        display_order: parseInt(display_order),
      },
    });

    res.status(201).json(newSection);
  } catch (error) {
    console.error("Erro ao adicionar seção ao template:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao adicionar seção.' });
  }
};

/**
 * Adiciona uma nova subseção a uma Seção de Template existente.
 */
export const addSubsectionToSection = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ message: 'Acesso negado.' });
  // }

  try {
    const { sectionId } = req.params;
    const { title, display_order } = req.body;

    if (!title || display_order === undefined) {
      return res.status(400).json({ message: 'Título e Ordem de Exibição são obrigatórios para a subseção.' });
    }

    const newSubsection = await prisma.templateSubsection.create({
      data: {
        section_id: sectionId,
        title,
        display_order: parseInt(display_order),
      },
    });

    res.status(201).json(newSubsection);
  } catch (error) {
    console.error("Erro ao adicionar subseção à seção:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao adicionar subseção.' });
  }
};

/**
 * Adiciona um novo Conjunto de Opções Dinâmicas a uma Subseção de Template existente.
 */
export const addDynamicOptionSetToSubsection = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ message: 'Acesso negado.' });
  // }

  try {
    const { subsectionId } = req.params;
    const { title, display_order, elements } = req.body;

    if (!title || display_order === undefined || !elements || !Array.isArray(elements)) {
      return res.status(400).json({ message: 'Título, Ordem de Exibição e elementos (array) são obrigatórios para o conjunto de opções dinâmicas.' });
    }

    const newDynamicOptionSet = await prisma.dynamicOptionSet.create({
      data: {
        subsection_id: subsectionId,
        title,
        display_order: parseInt(display_order),
        elements: {
          create: elements.map((element: any) => ({
            source_action_id: uuidv4(), // Gerar um ID único para cada elemento
            type: element.type,
            label: element.label,
            default_value: element.default_value || null,
            is_default_selected: element.is_default_selected || false,
          })),
        },
      },
      include: {
        elements: true,
      },
    });

    res.status(201).json(newDynamicOptionSet);
  } catch (error: any) {
    console.error("Erro ao adicionar conjunto de opções dinâmicas à subseção:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao adicionar conjunto de opções dinâmicas.' });
  }
};

/**
 * Atualiza um Conjunto de Opções Dinâmicas existente.
 */
export const updateDynamicOptionSet = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) { return res.status(403).json({ message: 'Acesso negado.' }); }
  try {
    const { id } = req.params;
    const { title, display_order } = req.body;

    const updatedDynamicOptionSet = await prisma.dynamicOptionSet.update({
      where: { id },
      data: {
        title: title,
        display_order: display_order !== undefined ? parseInt(display_order) : undefined,
      },
    });
    res.status(200).json(updatedDynamicOptionSet);
  } catch (error) {
    console.error("Erro ao atualizar conjunto de opções dinâmicas:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar conjunto de opções dinâmicas.' });
  }
};

/**
 * Deleta um Conjunto de Opções Dinâmicas existente.
 */
export const deleteDynamicOptionSet = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) { return res.status(403).json({ message: 'Acesso negado.' }); }
  try {
    const { id } = req.params;
    await prisma.dynamicOptionSet.delete({
      where: { id },
    });
    res.status(204).send(); // No Content
  } catch (error) {
    console.error("Erro ao deletar conjunto de opções dinâmicas:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar conjunto de opções dinâmicas.' });
  }
};

/**
 * Adiciona um novo Elemento Interativo a um Conjunto de Opções Dinâmicas existente.
 */
export const addInteractiveElementToDynamicOptionSet = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ message: 'Acesso negado.' });
  // }

  try {
    const { dynamicOptionSetId } = req.params;
    const { type, label, default_value, is_default_selected } = req.body;
    const source_action_id = uuidv4(); // Generate a unique ID

    if (!type || !label) {
      return res.status(400).json({ message: 'type e label são obrigatórios para o elemento interativo.' });
    }

    const newElement = await prisma.interactiveElement.create({
      data: {
        dynamic_option_set_id: dynamicOptionSetId,
        source_action_id,
        type,
        label,
        default_value: default_value || null,
        is_default_selected: is_default_selected || false,
      },
    });

    res.status(201).json(newElement);
  } catch (error: any) {
    if (error.code === 'P2002') { // Prisma error code for unique constraint violation
      return res.status(409).json({ message: 'ID da Ação (source_action_id) já existe. Por favor, use um ID único.' });
    }
    console.error("Erro ao adicionar elemento interativo ao conjunto de opções dinâmicas:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao adicionar elemento interativo.' });
  }
};

/**
 * Atualiza uma Seção de Template existente.
 */
export const updateSection = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) { return res.status(403).json({ message: 'Acesso negado.' }); }
  try {
    const { sectionId } = req.params;
    const { title, default_text, display_order } = req.body;

    const updatedSection = await prisma.templateSection.update({
      where: { id: sectionId },
      data: {
        title: title,
        default_text: default_text,
        display_order: display_order !== undefined ? parseInt(display_order) : undefined,
      },
    });
    res.status(200).json(updatedSection);
  } catch (error) {
    console.error("Erro ao atualizar seção:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar seção.' });
  }
};

/**
 * Deleta uma Seção de Template existente.
 */
export const deleteSection = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) { return res.status(403).json({ message: 'Acesso negado.' }); }
  try {
    const { sectionId } = req.params;
    await prisma.templateSection.delete({
      where: { id: sectionId },
    });
    res.status(204).send(); // No Content
  } catch (error) {
    console.error("Erro ao deletar seção:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar seção.' });
  }
};

/**
 * Atualiza uma Subseção de Template existente.
 */
export const updateSubsection = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) { return res.status(403).json({ message: 'Acesso negado.' }); }
  try {
    const { subsectionId } = req.params;
    const { title, display_order } = req.body;

    const updatedSubsection = await prisma.templateSubsection.update({
      where: { id: subsectionId },
      data: {
        title: title,
        display_order: display_order !== undefined ? parseInt(display_order) : undefined,
      },
    });
    res.status(200).json(updatedSubsection);
  } catch (error) {
    console.error("Erro ao atualizar subseção:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar subseção.' });
  }
};

/**
 * Deleta uma Subseção de Template existente.
 */
export const deleteSubsection = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ message: 'Acesso negado.' });
  // }

  try {
    const { subsectionId } = req.params;
    await prisma.templateSubsection.delete({ where: { id: subsectionId } });
    res.status(204).send(); // No Content
  } catch (error) {
    console.error("Erro ao deletar subseção:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar subseção.' });
  }
};

/**
 * Atualiza um Elemento Interativo existente.
 */
export const updateInteractiveElement = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) { return res.status(403).json({ message: 'Acesso negado.' }); }
  try {
    const { elementId } = req.params;
    const { dynamic_option_set_id, source_action_id, type, label, default_value, is_default_selected } = req.body;

    const updatedElement = await prisma.interactiveElement.update({
      where: { id: elementId },
      data: {
        dynamic_option_set_id: dynamic_option_set_id,
        source_action_id: source_action_id,
        type: type,
        label: label,
        default_value: default_value,
        is_default_selected: is_default_selected !== undefined ? is_default_selected : undefined,
      },
    });
    res.status(200).json(updatedElement);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'ID da Ação (source_action_id) já existe. Por favor, use um ID único.' });
    }
    console.error("Erro ao atualizar elemento interativo:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar elemento interativo.' });
  }
};

/**
 * Deleta um Elemento Interativo existente.
 */
export const deleteInteractiveElement = async (req: any, res: Response) => {
  // if (!req.user?.isAdmin) { return res.status(403).json({ message: 'Acesso negado.' }); }
  try {
    const { elementId } = req.params;

    // Find the interactive element to get its source_action_id
    const interactiveElement = await prisma.interactiveElement.findUnique({
      where: { id: elementId },
      select: { source_action_id: true },
    });

    if (!interactiveElement) {
      return res.status(404).json({ message: 'Elemento interativo não encontrado.' });
    }

    await prisma.$transaction(async (prisma) => {
      // Delete the associated ActionRule first
      await prisma.actionRule.deleteMany({
        where: { source_action_id: interactiveElement.source_action_id },
      });

      // Then delete the InteractiveElement
      await prisma.interactiveElement.delete({
        where: { id: elementId },
      });
    });

    res.status(204).send(); // No Content
  } catch (error) {
    console.error("Erro ao deletar elemento interativo:", error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar elemento interativo.' });
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
  }  catch (error) {
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
              include: {
                dynamicOptionSets: {
                  orderBy: { display_order: 'asc' },
                  include: {
                    elements: {
                      include: {
                        actionRule: true, // Include the related ActionRule
                      },
                    },
                  },
                },
              },
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
 * ATUALIZA um Template.
 */
export const updateTemplate = async (req: Request, res: Response) => {
  // A verificação de admin está comentada para fins de teste
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ message: 'Acesso negado.' });
  // }

  try {
    const { id } = req.params;
    const { name, category_id, sections, report_title, report_title_alignment, report_title_uppercase, report_title_bold } = req.body;

    // Verifica se o template existe
    const existingTemplate = await prisma.template.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            subsections: {
              include: {
                dynamicOptionSets: {
                  include: {
                    elements: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingTemplate) {
      return res.status(404).json({ message: 'Template não encontrado.' });
    }

    // Atualiza o template principal
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name: name || existingTemplate.name,
        category_id: category_id !== undefined ? category_id : existingTemplate.category_id,
        report_title: report_title !== undefined ? report_title : existingTemplate.report_title,
        report_title_alignment: report_title_alignment !== undefined ? report_title_alignment : existingTemplate.report_title_alignment,
        report_title_uppercase: report_title_uppercase !== undefined ? report_title_uppercase : existingTemplate.report_title_uppercase,
        report_title_bold: report_title_bold !== undefined ? report_title_bold : existingTemplate.report_title_bold,
      },
      include: {
        sections: {
          include: {
            subsections: {
              include: {
                dynamicOptionSets: {
                  include: {
                    elements: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Lógica para atualizar seções existentes
    if (sections && Array.isArray(sections)) {
      for (const sectionData of sections) {
        if (sectionData.id) { // Se a seção tem ID, tenta atualizar
          await prisma.templateSection.update({
            where: { id: sectionData.id },
            data: {
              title: sectionData.title,
              default_text: sectionData.default_text,
              display_order: sectionData.display_order,
            },
          });

          // Lógica para atualizar subseções existentes dentro desta seção
          if (sectionData.subsections && Array.isArray(sectionData.subsections)) {
            for (const subsectionData of sectionData.subsections) {
              if (subsectionData.id) { // Se a subseção tem ID, tenta atualizar
                await prisma.templateSubsection.update({
                  where: { id: subsectionData.id },
                  data: {
                    title: subsectionData.title,
                    display_order: subsectionData.display_order,
                  },
                });

                // Lógica para atualizar elementos interativos existentes dentro desta subseção
                if (subsectionData.elements && Array.isArray(subsectionData.elements)) {
                  for (const elementData of subsectionData.elements) {
                    if (elementData.id) { // Se o elemento tem ID, tenta atualizar
                      await prisma.interactiveElement.update({
                        where: { id: elementData.id },
                        data: {
                          source_action_id: elementData.source_action_id,
                          type: elementData.type,
                          label: elementData.label,
                          default_value: elementData.default_value,
                          is_default_selected: elementData.is_default_selected,
                        },
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Rebusca o template completo para retornar o estado atualizado
    const finalTemplate = await prisma.template.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { display_order: 'asc' },
          include: {
            subsections: {
              orderBy: { display_order: 'asc' },
              include: {
                dynamicOptionSets: {
                  include: {
                    elements: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json(finalTemplate);
  } catch (error) {
    console.error(`Erro ao atualizar o template com ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar o template.' });
  }
};

/**
 * DELETA um Template.
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  // A verificação de admin está comentada para fins de teste
  // if (!req.user?.isAdmin) {
  //   return res.status(403).json({ message: 'Acesso negado.' });
  // }

  try {
    const { id } = req.params;

    // Verifica se o template existe antes de tentar deletar
    const existingTemplate = await prisma.template.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return res.status(404).json({ message: 'Template não encontrado.' });
    }

    await prisma.template.delete({
      where: { id },
    });

    res.status(204).send(); // 204 No Content para sucesso sem retorno de corpo
  } catch (error) {
    console.error(`Erro ao deletar o template com ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar o template.' });
  }
};
