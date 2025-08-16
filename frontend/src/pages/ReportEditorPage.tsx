import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Spin, theme } from 'antd';
import { getTemplateById } from '../api/templateService';
import type {
  Template,
  Section,
  Subsection,
  ElementGroup
} from '../types/template';
import { ReportSidebar } from '../components/report/ReportSidebar';
import { InteractionPanel } from '../components/report/InteractionPanel';
import { ReportPreview } from '../components/report/ReportPreview';

const { Content, Sider } = Layout;

export interface SelectedOptions {
  [elementId: string]: string | string[]; // Stores selected option IDs or text for text areas
}

const ReportEditorPage: React.FC = () => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubsection, setSelectedSubsection] = useState<Subsection | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [reportText, setReportText] = useState<string>('');

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch template data on component mount
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const mockTemplateId = 'template-001'; // Use a mock ID for now
        const data = await getTemplateById(mockTemplateId);
        setTemplate(data);
        // Set the first subsection as selected by default
        if (data.sections.length > 0 && data.sections[0].subsections.length > 0) {
          setSelectedSubsection(data.sections[0].subsections[0]);
        }
      } catch (error) {
        console.error('Failed to fetch template:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  // Callback for when a subsection is selected in the sidebar
  const handleSubsectionSelect = useCallback((subsectionId: string) => {
    if (template) {
      for (const section of template.sections) {
        const foundSubsection = section.subsections.find(sub => sub.id === subsectionId);
        if (foundSubsection) {
          setSelectedSubsection(foundSubsection);
          break;
        }
      }
    }
  }, [template]);

  // Callback for when an option is changed in the interaction panel
  const handleOptionChange = useCallback((elementId: string, value: string | string[]) => {
    setSelectedOptions(prevOptions => {
      const newOptions = { ...prevOptions };
      if (Array.isArray(value) && value.length === 0) {
        delete newOptions[elementId]; // Remove if no checkboxes are selected
      } else if (value === '') {
        delete newOptions[elementId]; // Remove if text area is empty
      } else {
        newOptions[elementId] = value;
      }
      return newOptions;
    });
  }, []);

  // Logic to generate the report text
  useEffect(() => {
    if (!template) return;

    let currentReportText = template.baseContent;

    // Iterate through all sections and subsections to find the options
    template.sections.forEach(section => {
      section.subsections.forEach(subsection => {
        subsection.elementGroups.forEach(group => {
          group.interactiveElements.forEach(element => {
            if (selectedOptions[element.id]) {
              const selectedValue = selectedOptions[element.id];
              if (element.type === 'BUTTON_GROUP' || element.type === 'CHECKBOX') {
                const selectedOptionIds = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
                selectedOptionIds.forEach(optionId => {
                  const option = element.options?.find(opt => opt.id === optionId);
                  if (option && option.textToAdd) {
                    currentReportText += option.textToAdd;
                  }
                });
              } else if (element.type === 'TEXT_AREA') {
                if (typeof selectedValue === 'string' && selectedValue.trim() !== '') {
                  currentReportText += selectedValue + ' '; // Add text area content
                }
              }
            }
          });
        });
      });
    });

    setReportText(currentReportText.trim());
  }, [template, selectedOptions]);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Carregando modelo de laudo..." />
      </Layout>
    );
  }

  if (!template) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Erro ao carregar o modelo de laudo.</div>
      </Layout>
    );
  }

  return (
    <Layout style={{ height: '100%', display: 'flex', flexDirection: 'row' }}> {/* Adjust minHeight for header if present */}
      <Sider
        width={250}
        style={{
          background: colorBgContainer,
          padding: '16px',
          borderRadius: borderRadiusLG,
          marginRight: '16px',
        }}
      >
        <ReportSidebar
          sections={template.sections}
          onSelectSubsection={handleSubsectionSelect}
          selectedSubsectionId={selectedSubsection?.id || ''}
        />
      </Sider>
      <Content
        style={{
          background: colorBgContainer,
          padding: '16px',
          borderRadius: borderRadiusLG,
          marginRight: '16px',
          overflowY: 'auto',
          flex: 1, // Allow content to grow
        }}
      >
        {selectedSubsection ? (
          <InteractionPanel
            elementGroups={selectedSubsection.elementGroups}
            selectedOptions={selectedOptions}
            onOptionChange={handleOptionChange}
          />
        ) : (
          <div>Selecione uma subseção para começar.</div>
        )}
      </Content>
      <Sider
        width={400}
        style={{
          background: colorBgContainer,
          padding: '16px',
          borderRadius: borderRadiusLG,
          overflowY: 'auto',
        }}
      >
        <ReportPreview reportText={reportText} />
      </Sider>
    </Layout>
  );
};

export default ReportEditorPage;
