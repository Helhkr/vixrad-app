import type { Template } from '../types/template';

/**
 * Mock API service for fetching report templates.
 * In a real application, this would make an Axios call to the backend.
 */
export const getTemplateById = async (id: string): Promise<Template> => {
  console.log(`Fetching mock template with ID: ${id}`);

  // Mock data representing a complete report template
  const mockTemplate: Template = {
    id: 'template-001',
    name: 'Laudo de Exemplo',
    baseContent: 'Este é o laudo inicial. ',
    sections: [
      {
        id: 'sec-001',
        name: 'Dados do Paciente',
        subsections: [
          {
            id: 'sub-001-1',
            name: 'Informações Básicas',
            elementGroups: [
              {
                id: 'eg-001-1-1',
                name: 'Gênero',
                interactiveElements: [
                  {
                    id: 'ie-001-1-1-1',
                    type: 'BUTTON_GROUP',
                    label: 'Gênero do Paciente',
                    options: [
                      { id: 'opt-masc', value: 'Masculino', textToAdd: 'Paciente do sexo masculino. ' },
                      { id: 'opt-fem', value: 'Feminino', textToAdd: 'Paciente do sexo feminino. ' },
                    ],
                  },
                ],
              },
              {
                id: 'eg-001-1-2',
                name: 'Idade',
                interactiveElements: [
                  {
                    id: 'ie-001-1-2-1',
                    type: 'TEXT_AREA',
                    label: 'Observações sobre a idade',
                    placeholder: 'Ex: Paciente jovem, idoso, etc.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'sec-002',
        name: 'Achados',
        subsections: [
          {
            id: 'sub-002-1',
            name: 'Achados Gerais',
            elementGroups: [
              {
                id: 'eg-002-1-1',
                name: 'Presença de Nódulos',
                interactiveElements: [
                  {
                    id: 'ie-002-1-1-1',
                    type: 'BUTTON_GROUP',
                    label: 'Nódulos Presentes?',
                    options: [
                      { id: 'opt-nod-sim', value: 'Sim', textToAdd: 'Nódulos presentes. ' },
                      { id: 'opt-nod-nao', value: 'Não', textToAdd: 'Nódulos não presentes. ' },
                    ],
                  },
                ],
              },
              {
                id: 'eg-002-1-2',
                name: 'Detalhes dos Nódulos',
                interactiveElements: [
                  {
                    id: 'ie-002-1-2-1',
                    type: 'CHECKBOX',
                    label: 'Características',
                    options: [
                      { id: 'opt-nod-calc', value: 'Calcificações', textToAdd: 'Com calcificações. ' },
                      { id: 'opt-nod-irreg', value: 'Bordas Irregulares', textToAdd: 'Bordas irregulares. ' },
                    ],
                  },
                  {
                    id: 'ie-002-1-2-2',
                    type: 'TEXT_AREA',
                    label: 'Descrição Adicional',
                    placeholder: 'Descreva os nódulos aqui...',
                  },
                ],
                actionRule: {
                  id: 'ar-001',
                  triggerOptionId: 'opt-nod-sim', // This group only appears if 'Sim' for Nódulos is selected
                },
              },
            ],
          },
          {
            id: 'sub-002-2',
            name: 'Achados Específicos',
            elementGroups: [
              {
                id: 'eg-002-2-1',
                name: 'Outros Achados',
                interactiveElements: [
                  {
                    id: 'ie-002-2-1-1',
                    type: 'TEXT_AREA',
                    label: 'Outras observações',
                    placeholder: 'Descreva outros achados relevantes...',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'sec-003',
        name: 'Conclusão',
        subsections: [
          {
            id: 'sub-003-1',
            name: 'Conclusão Final',
            elementGroups: [
              {
                id: 'eg-003-1-1',
                name: 'Texto da Conclusão',
                interactiveElements: [
                  {
                    id: 'ie-003-1-1-1',
                    type: 'TEXT_AREA',
                    label: 'Conclusão do Laudo',
                    placeholder: 'Digite a conclusão aqui...',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return mockTemplate;
};
