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

  // Recursive helper to clear selected options for a given element and its children
  const clearElementSelections = useCallback((element: InteractiveElement, currentOptions: SelectedOptions) => {
    const newOptions = { ...currentOptions };
    delete newOptions[element.id]; // Clear the element itself

    if (element.type === 'SEGMENTED' || element.type === 'CHECKBOX') {
      element.options?.forEach(option => {
        if (option.childElements) {
          option.childElements.forEach(childElement => {
            Object.assign(newOptions, clearElementSelections(childElement, newOptions));
          });
        }
      });
    }
    return newOptions;
  }, []);

  // Callback for when an option is changed in the interaction panel
  const handleOptionChange = useCallback((elementId: string, value: string | string[]) => {
    setSelectedOptions(prevOptions => {
      let newOptions = { ...prevOptions };

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

      if (currentElement.type === 'SEGMENTED') {
        const previouslySelectedOptionId = newOptions[elementId] as string;
        const previouslySelectedOption = currentElement.options?.find(opt => opt.id === previouslySelectedOptionId);

        // If the new value is the same as the old, it means deselect (toggle behavior)
        if (previouslySelectedOptionId === value) {
          delete newOptions[elementId];
          // Clear all children of the deselected option
          if (previouslySelectedOption && previouslySelectedOption.childElements) {
            previouslySelectedOption.childElements.forEach(child => {
              newOptions = clearElementSelections(child, newOptions);
            });
          }
        } else {
          // If selecting a new option, first clear children of the old option if any
          if (previouslySelectedOption && previouslySelectedOption.childElements) {
            previouslySelectedOption.childElements.forEach(child => {
              newOptions = clearElementSelections(child, newOptions);
            });
          }
          newOptions[elementId] = value;
        }
      } else if (currentElement.type === 'CHECKBOX') {
        // For CHECKBOX, handle array of selected values
        const oldSelectedValues = (newOptions[elementId] || []) as string[];
        const newSelectedValues = value as string[];

        // Identify options that were deselected
        const deselectedOptionIds = oldSelectedValues.filter(id => !newSelectedValues.includes(id));

        deselectedOptionIds.forEach(deselectedId => {
          const deselectedOption = currentElement.options?.find(opt => opt.id === deselectedId);
          if (deselectedOption && deselectedOption.childElements) {
            deselectedOption.childElements.forEach(child => {
              newOptions = clearElementSelections(child, newOptions);
            });
          }
        });

        if (newSelectedValues.length === 0) {
          delete newOptions[elementId];
        } else {
          newOptions[elementId] = newSelectedValues;
        }
      } else if (currentElement.type === 'TEXT_AREA' || currentElement.type === 'INPUT_NUMBER') {
        if (typeof value === 'string' && value.trim() === '') {
          delete newOptions[elementId];
        } else {
          newOptions[elementId] = value;
        }
      }
      return newOptions;
    });
  }, [template, clearElementSelections]);

  const handleNestedOptionChange = useCallback((parentId: string, elementId: string, value: string | string[]) => {
    setSelectedOptions(prevOptions => {
      const newOptions = { ...prevOptions };
      // For nested options, we just update the selectedOptions directly
      if (Array.isArray(value) && value.length === 0) {
        delete newOptions[elementId];
      } else if (typeof value === 'string' && value.trim() === '') {
        delete newOptions[elementId];
      } else {
        newOptions[elementId] = value;
      }
      return newOptions;
    });
  }, []);

  // Recursive function to collect text from interactive elements and their children
  const collectTextFromElements = useCallback((elements: InteractiveElement[], currentSelectedOptions: SelectedOptions): string => {
    let accumulatedText = '';

    elements.forEach(element => {
      const selectedValue = currentSelectedOptions[element.id];

      if (element.type === 'SEGMENTED') {
        if (selectedValue) {
          const selectedOption = element.options?.find(opt => opt.id === selectedValue);
          if (selectedOption) {
            if (selectedOption.textToAdd) {
              accumulatedText += selectedOption.textToAdd + ' ';
            }
            // Recursively collect text from child elements if the option is selected
            if (selectedOption.childElements && selectedOption.childElements.length > 0) {
              accumulatedText += collectTextFromElements(selectedOption.childElements, currentSelectedOptions);
            }
          }
        }
      } else if (element.type === 'CHECKBOX') {
        if (Array.isArray(selectedValue) && selectedValue.length > 0) {
          selectedValue.forEach(optionId => {
            const option = element.options?.find(opt => opt.id === optionId);
            if (option) {
              if (option.textToAdd) {
                accumulatedText += option.textToAdd + ' ';
              }
              // Recursively collect text from child elements if this checkbox option is selected
              if (option.childElements && option.childElements.length > 0) {
                accumulatedText += collectTextFromElements(option.childElements, currentSelectedOptions);
              }
            }
          });
        }
      } else if (element.type === 'TEXT_AREA' || element.type === 'INPUT_NUMBER') {
        if (typeof selectedValue === 'string' && selectedValue.trim() !== '') {
          accumulatedText += selectedValue + ' ';
        }
      }
    });
    return accumulatedText;
  }, []);

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
            const paragraphs: string[] = [];

            // Collect text from all element groups within this subsection, each as a separate paragraph
            subsection.elementGroups.forEach(group => {
              const groupText = collectTextFromElements(group.interactiveElements, selectedOptions).trim();
              if (groupText !== '') {
                paragraphs.push(groupText);
              }
            });

            // If no content was generated for the subsection, add a placeholder paragraph
            if (paragraphs.length === 0) {
              paragraphs.push(`[${subsection.name}]`);
            }

            return {
              id: subsection.id,
              name: subsection.name,
              paragraphs: paragraphs,
            };
          }),
      })),
    };

    return report;
  }, [template, selectedOptions, activeSubsections, collectTextFromElements]); // Added collectTextFromElements to dependencies

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
            onNestedOptionChange={handleNestedOptionChange}
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