import * as TemplateTypes from '../types/template';

/**
 * Mock API service for fetching report templates.
 * In a real application, this would make an Axios call to the backend.
 */
export const getTemplateById = async (id: string): Promise<TemplateTypes.Template> => {
  console.log(`Fetching mock template with ID: ${id}`);

  // Mock data representing a complete report template with conditional logic
  const mockTemplate: TemplateTypes.Template = {
    id: 'template-001',
    name: 'Laudo de Exemplo com Condicional',
    reportTitle: 'TOMOGRAFIA COMPUTADORIZADA DE CRÂNIO',
    modality: 'TC',
    sections: [
      {
        id: 'sec-001',
        name: 'Achados',
        subsections: [
          {
            id: 'sub-001-1',
            name: 'Nódulos',
            isActive: true,
            elementGroups: [
              {
                id: 'eg-nod-presence',
                name: 'Presença de Nódulos',
                interactiveElements: [
                  {
                    id: 'ie-nod-present',
                    type: 'SEGMENTED',
                    label: 'Nódulos Presentes?',
                    isVisibleByDefault: true,
                    options: [
                      {
                        id: 'opt-nod-sim',
                        label: 'Sim',
                        textToAdd: 'Nódulos presentes. ',
                        childElements: [
                          {
                            id: 'ie-nod-size',
                            type: 'INPUT_NUMBER',
                            label: 'Tamanho (mm)',
                            isVisibleByDefault: true,
                            placeholder: 'Insira o tamanho em mm',
                          },
                          {
                            id: 'ie-nod-location',
                            type: 'TEXT_AREA',
                            label: 'Localização',
                            isVisibleByDefault: true,
                            placeholder: 'Descreva a localização...',
                          },
                          {
                            id: 'ie-nod-characteristics',
                            type: 'CHECKBOX',
                            label: 'Características do Nódulo',
                            isVisibleByDefault: true,
                            options: [
                              {
                                id: 'opt-nod-benign',
                                label: 'Benigno',
                                textToAdd: 'Com características benignas. ',
                                childElements: [
                                  {
                                    id: 'ie-nod-followup',
                                    type: 'SEGMENTED',
                                    label: 'Acompanhamento?',
                                    isVisibleByDefault: true,
                                    options: [
                                      { id: 'opt-followup-yes', label: 'Sim', textToAdd: 'Recomendado acompanhamento. ', childElements: [] },
                                      { id: 'opt-followup-no', label: 'Não', textToAdd: 'Sem necessidade de acompanhamento. ', childElements: [] },
                                    ],
                                  },
                                ],
                              },
                              {
                                id: 'opt-nod-malignant',
                                label: 'Maligno',
                                textToAdd: 'Com características malignas. ',
                                childElements: [
                                  {
                                    id: 'ie-nod-biopsy',
                                    type: 'CHECKBOX',
                                    label: 'Biópsia Necessária?',
                                    isVisibleByDefault: true,
                                    options: [
                                      { id: 'opt-biopsy-yes', label: 'Sim', textToAdd: 'Biópsia recomendada. ', childElements: [] },
                                      { id: 'opt-biopsy-no', label: 'Não', textToAdd: 'Biópsia não indicada. ', childElements: [] },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      { id: 'opt-nod-nao', label: 'Não', textToAdd: 'Nódulos não presentes. ', childElements: [] },
                    ],
                  },
                ],
              },
              {
                id: 'eg-nod-details',
                name: 'Detalhes do Nódulo',
                interactiveElements: [
                  {
                    id: 'ie-nod-calc',
                    type: 'CHECKBOX',
                    label: 'Calcificações',
                    isVisibleByDefault: true,
                    options: [
                      {
                        id: 'opt-calc-sim',
                        label: 'Sim',
                        textToAdd: 'Com calcificações. ',
                        childElements: [
                          {
                            id: 'ie-calc-type',
                            type: 'SEGMENTED',
                            label: 'Tipo de Calcificação',
                            isVisibleByDefault: true,
                            options: [
                              { id: 'opt-calc-punctate', label: 'Puntiforme', textToAdd: 'Tipo puntiforme. ', childElements: [] },
                              { id: 'opt-calc-coarse', label: 'Grosseira', textToAdd: 'Tipo grosseira. ', childElements: [] },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: 'ie-nod-desc',
                    type: 'TEXT_AREA',
                    label: 'Descrição Adicional',
                    isVisibleByDefault: true,
                    placeholder: 'Descreva os nódulos aqui...',
                  },
                ],
              },
            ],
          },
          {
            id: 'sub-001-2',
            name: 'Outros Achados',
            isActive: true,
            elementGroups: [
              {
                id: 'eg-other-findings',
                name: 'Achados Diversos',
                interactiveElements: [
                  {
                    id: 'ie-other-cysts',
                    type: 'CHECKBOX',
                    label: 'Cistos Presentes?',
                    isVisibleByDefault: true,
                    options: [
                      {
                        id: 'opt-cysts-yes',
                        label: 'Sim',
                        textToAdd: 'Cistos presentes. ',
                        childElements: [
                          {
                            id: 'ie-cysts-number',
                            type: 'INPUT_NUMBER',
                            label: 'Número de Cistos',
                            isVisibleByDefault: true,
                            placeholder: 'Quantos cistos?',
                          },
                          {
                            id: 'ie-cysts-type',
                            type: 'SEGMENTED',
                            label: 'Tipo de Cisto',
                            isVisibleByDefault: true,
                            options: [
                              { id: 'opt-cysts-simple', label: 'Simples', textToAdd: 'Cisto simples. ', childElements: [] },
                              { id: 'opt-cysts-complex', label: 'Complexo', textToAdd: 'Cisto complexo. ', childElements: [] },
                            ],
                          },
                        ],
                      },
                      { id: 'opt-cysts-no', label: 'Não', textToAdd: 'Sem cistos. ', childElements: [] },
                    ],
                  },
                  {
                    id: 'ie-other-vascular',
                    type: 'SEGMENTED',
                    label: 'Anormalidades Vasculares?',
                    isVisibleByDefault: true,
                    options: [
                      {
                        id: 'opt-vascular-yes',
                        label: 'Sim',
                        textToAdd: 'Anormalidade vascular identificada. ',
                        childElements: [
                          {
                            id: 'ie-vascular-type',
                            type: 'CHECKBOX',
                            label: 'Tipo de Anormalidade',
                            isVisibleByDefault: true,
                            options: [
                              { id: 'opt-vascular-aneurysm', label: 'Aneurisma', textToAdd: 'Aneurisma presente. ', childElements: [] },
                              { id: 'opt-vascular-stenosis', label: 'Estenose', textToAdd: 'Estenose observada. ', childElements: [] },
                            ],
                          },
                        ],
                      },
                      { id: 'opt-vascular-no', label: 'Não', textToAdd: 'Sem anormalidades vasculares. ', childElements: [] },
                    ],
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

export const getAllTemplates = async (): Promise<Array<{ id: string; name: string; modality: string }>> => {
  console.log("Fetching mock list of templates");

  const mockTemplates = [
    { id: 'temp-001', name: 'Laudo de Crânio Padrão', modality: 'CR' },
    { id: 'temp-002', name: 'Laudo de Abdome Total', modality: 'US' },
    { id: 'temp-003', name: 'Laudo de Coluna Lombar', modality: 'MR' },
    { id: 'temp-004', name: 'Laudo de Tórax', modality: 'CR' },
  ];

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return mockTemplates;
};