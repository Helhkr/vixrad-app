import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Layout, Spin, theme } from 'antd';
import { getTemplateById } from '../api/templateService';
import type {
  Template,
  Subsection,
  Option,
  SelectedOptions,
  StructuredReport,
  InteractiveElement
} from '../types/template';
import { ReportSidebar } from '../components/report/ReportSidebar';
import { InteractionPanel } from '../components/report/InteractionPanel';
import { ReportPreview } from '../components/report/ReportPreview';

const { Content, Sider } = Layout;

const ReportEditorPage: React.FC = () => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubsection, setSelectedSubsection] = useState<Subsection | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [activeSubsections, setActiveSubsections] = useState<Record<string, boolean>>({}); // New state for active/inactive subsections

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

        // Initialize activeSubsections based on template data
        const initialActiveSubsections: Record<string, boolean> = {};
        data.sections.forEach(section => {
          section.subsections.forEach(subsection => {
            initialActiveSubsections[subsection.id] = subsection.isActive;
          });
        });
        setActiveSubsections(initialActiveSubsections);

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

  // Callback to toggle subsection active state
  const handleToggleSubsectionActive = useCallback((subsectionId: string) => {
    setActiveSubsections(prevActive => ({
      ...prevActive,
      [subsectionId]: !prevActive[subsectionId],
    }));
  }, []);

  // Callback for when an option is changed in the interaction panel
  const handleOptionChange = useCallback((elementId: string, value: string | string[]) => {
    setSelectedOptions(prevOptions => {
      const newOptions = { ...prevOptions };

      // Find the element to determine its type and options
      let currentElement: InteractiveElement | undefined;
      template?.sections.forEach(section => {
        section.subsections.forEach(subsection => {
          subsection.elementGroups.forEach(group => {
            const found = group.interactiveElements.find(el => el.id === elementId);
            if (found) {
              currentElement = found;
            }
          });
        });
      });

      if (!currentElement) {
        return prevOptions; // Element not found, do nothing
      }

      if (currentElement.type === 'BUTTON_GROUP') {
        // For BUTTON_GROUP, only one option can be selected at a time.
        // If the clicked option is already selected, deselect it.
        if (newOptions[elementId] === value) {
          delete newOptions[elementId];
        } else {
          newOptions[elementId] = value;
        }
      } else if (currentElement.type === 'CHECKBOX') {
        // For CHECKBOX, handle array of selected values
        if (Array.isArray(value) && value.length === 0) {
          delete newOptions[elementId];
        } else {
          newOptions[elementId] = value;
        }
      } else if (currentElement.type === 'TEXT_AREA') {
        // For TEXT_AREA, handle string value
        if (typeof value === 'string' && value.trim() === '') {
          delete newOptions[elementId];
        } else {
          newOptions[elementId] = value;
        }
      }
      return newOptions;
    });
  }, [template]);

  // Logic to generate the structured report text
  const structuredReport = useMemo<StructuredReport | null>(() => {
    if (!template) return null;

    const report: StructuredReport = {
      title: template.reportTitle,
      sections: template.sections.map(section => ({
        id: section.id,
        name: section.name,
        content: section.subsections
          .filter(subsection => activeSubsections[subsection.id]) // Filter active subsections
          .map(subsection => {
            let subsectionContent = `[${subsection.name}]`; // Start with placeholder

            // Collect all interactive elements and their options for easy lookup
            const allOptions = new Map<string, Option>();
            const allElements = new Map<string, InteractiveElement>();

            subsection.elementGroups.forEach(group => {
              group.interactiveElements.forEach(element => {
                allElements.set(element.id, element);
                if (element.options) {
                  element.options.forEach(option => {
                    allOptions.set(option.id, option);
                  });
                }
              });
            });

            let accumulatedTextForSubsection = '';

            // Iterate through elements in this subsection to find selected options
            subsection.elementGroups.forEach(group => {
              group.interactiveElements.forEach(element => {
                const selectedValue = selectedOptions[element.id];

                if (element.type === 'BUTTON_GROUP') {
                  if (selectedValue) {
                    const selectedOption = element.options?.find(opt => opt.id === selectedValue);
                    if (selectedOption) {
                      accumulatedTextForSubsection += selectedOption.textToAdd;
                    }
                  }
                } else if (element.type === 'CHECKBOX') {
                  if (Array.isArray(selectedValue) && selectedValue.length > 0) {
                    selectedValue.forEach(optionId => {
                      const option = allOptions.get(optionId);
                      if (option && option.textToAdd) {
                        accumulatedTextForSubsection += option.textToAdd;
                      }
                    });
                  }
                } else if (element.type === 'TEXT_AREA') {
                  if (typeof selectedValue === 'string' && selectedValue.trim() !== '') {
                    accumulatedTextForSubsection += selectedValue + ' ';
                  }
                }
              });
            });

            // If there's accumulated text, replace the placeholder. Otherwise, keep the placeholder.
            if (accumulatedTextForSubsection.trim() !== '') {
              subsectionContent = accumulatedTextForSubsection.trim();
            }

            return {
              id: subsection.id,
              name: subsection.name,
              paragraphs: [subsectionContent],
            };
          }),
      })),
    };

    return report;
  }, [template, selectedOptions, activeSubsections]); // Added activeSubsections to dependencies

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large">
          <div style={{ marginTop: '16px', color: 'rgba(0, 0, 0, 0.88)' }}>Carregando modelo de laudo...</div>
        </Spin>
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
    <Layout style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
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
          activeSubsections={activeSubsections} // Pass activeSubsections
          onToggleSubsectionActive={handleToggleSubsectionActive} // Pass toggle handler
        />
      </Sider>
      <Content
        style={{
          background: colorBgContainer,
          padding: '16px',
          borderRadius: borderRadiusLG,
          marginRight: '16px',
          overflowY: 'auto',
          flex: 1,
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
        <ReportPreview
          structuredReport={structuredReport}
          activeSubsections={activeSubsections} // Pass activeSubsections
        />
      </Sider>
    </Layout>
  );
};

export default ReportEditorPage;