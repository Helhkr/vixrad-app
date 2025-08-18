import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Row, Col, List, Card, Space, Modal, Popconfirm, Typography, Checkbox } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { getTemplateById } from '../../api/templateService';
import * as TemplateTypes from '../../types/template';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import NestedInteractiveElementEditor from '../../components/admin/NestedInteractiveElementEditor';

const { Option: SelectOption } = Select;
const { Text } = Typography;

// Simple unique ID generator
const generateUniqueId = (prefix: string = 'id-') => {
  return prefix + Math.random().toString(36).substr(2, 9);
};

const TemplateEditorAdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mainForm] = Form.useForm(); // Main form for template basic info
  const [sectionForm] = Form.useForm(); // Form for section modal
  const [subsectionForm] = Form.useForm(); // Form for subsection modal
  const [elementGroupForm] = Form.useForm(); // Form for element group modal

  const [template, setTemplate] = useState<TemplateTypes.Template | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<TemplateTypes.Section | TemplateTypes.Subsection | TemplateTypes.ElementGroup | null>(null); // Removed InteractiveElement from selectedItem type

  // Modals state
  const [isSectionModalVisible, setIsSectionModalVisible] = useState(false);
  const [isSubsectionModalVisible, setIsSubsectionModalVisible] = useState(false);
  const [isElementGroupModalVisible, setIsElementGroupModalVisible] = useState(false);
  const [currentEditingSection, setCurrentEditingSection] = useState<TemplateTypes.Section | null>(null);
  const [currentEditingSubsection, setCurrentEditingSubsection] = useState<TemplateTypes.Subsection | null>(null);
  const [currentEditingElementGroup, setCurrentEditingElementGroup] = useState<TemplateTypes.ElementGroup | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (id) {
        try {
          const data = await getTemplateById(id);
          setTemplate(data);
          mainForm.setFieldsValue(data);
        } catch (error) {
          console.error('Failed to fetch template:', error);
          // Optionally redirect to a 404 or error page
        } finally {
          setLoading(false);
        }
      } else {
        // Initialize for new template
        setTemplate({
          id: generateUniqueId('template-'),
          name: '',
          reportTitle: '',
          modality: '',
          sections: [],
        });
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id, mainForm]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!template) {
    return <div>Modelo não encontrado ou erro ao carregar.</div>;
  }

  // --- Handlers for Template Structure (Sections, Subsections) ---

  const handleAddSection = () => {
    setCurrentEditingSection(null);
    sectionForm.resetFields(); // Reset form fields for new entry
    setIsSectionModalVisible(true);
  };

  const handleEditSection = (section: TemplateTypes.Section) => {
    setCurrentEditingSection(section);
    sectionForm.setFieldsValue({ sectionName: section.name });
    setIsSectionModalVisible(true);
  };

  const handleSaveSection = (values: { sectionName: string }) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      let updatedSections;
      if (currentEditingSection) {
        // Edit existing section
        const updatedSection = { ...currentEditingSection, name: values.sectionName };
        updatedSections = prevTemplate.sections.map(sec =>
          sec.id === currentEditingSection.id ? updatedSection : sec
        );
        setSelectedItem(updatedSection);
      } else {
        // Add new section
        const newSection: TemplateTypes.Section = {
          id: generateUniqueId('sec-'),
          name: values.sectionName,
          subsections: [],
        };
        updatedSections = [...prevTemplate.sections, newSection];
        setSelectedItem(newSection);
      }
      return { ...prevTemplate, sections: updatedSections };
    });
    setIsSectionModalVisible(false);
    sectionForm.resetFields();
  };

  const handleDeleteSection = (sectionId: string) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      const updatedSections = prevTemplate.sections.filter(sec => sec.id !== sectionId);
      return { ...prevTemplate, sections: updatedSections };
    });
    setSelectedItem(null); // Clear selection if deleted
  };

  const handleAddSubsection = (sectionId: string) => {
    setCurrentEditingSection(template.sections.find(sec => sec.id === sectionId) || null);
    setCurrentEditingSubsection(null);
    subsectionForm.resetFields(); // Reset form fields for new entry
    setIsSubsectionModalVisible(true);
  };

  const handleEditSubsection = (section: TemplateTypes.Section, subsection: TemplateTypes.Subsection) => {
    setCurrentEditingSection(section);
    setCurrentEditingSubsection(subsection);
    subsectionForm.setFieldsValue({ subsectionName: subsection.name });
    setIsSubsectionModalVisible(true);
  };

  const handleSaveSubsection = (values: { subsectionName: string }) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      const updatedSections = prevTemplate.sections.map(sec => {
        if (sec.id === currentEditingSection?.id) {
          let updatedSubsections;
          if (currentEditingSubsection) {
            // Edit existing subsection
            updatedSubsections = sec.subsections.map(sub => {
              const updatedSub = sub.id === currentEditingSubsection.id ? { ...sub, name: values.subsectionName } : sub;
              if (sub.id === currentEditingSubsection.id) setSelectedItem(updatedSub);
              return updatedSub;
            });
          } else {
            // Add new subsection
            const newSubsection: TemplateTypes.Subsection = {
              id: generateUniqueId('sub-'),
              name: values.subsectionName,
              isActive: true, // Default to active
              elementGroups: [],
            };
            updatedSubsections = [...sec.subsections, newSubsection];
            setSelectedItem(newSubsection);
          }
          return { ...sec, subsections: updatedSubsections };
        }
        return sec;
      });
      return { ...prevTemplate, sections: updatedSections };
    });
    setIsSubsectionModalVisible(false);
    subsectionForm.resetFields();
  };

  const handleDeleteSubsection = (sectionId: string, subsectionId: string) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      const updatedSections = prevTemplate.sections.map(sec => {
        if (sec.id === sectionId) {
          const updatedSubsections = sec.subsections.filter(sub => sub.id !== subsectionId);
          return { ...sec, subsections: updatedSubsections };
        }
        return sec;
      });
      return { ...prevTemplate, sections: updatedSections };
    });
    setSelectedItem(null); // Clear selection if deleted
  };

  // --- Handlers for Element Groups ---

  const handleAddElementGroup = (subsection: TemplateTypes.Subsection) => {
    setCurrentEditingSubsection(subsection);
    setCurrentEditingElementGroup(null);
    elementGroupForm.resetFields(); // Reset form fields for new entry
    setIsElementGroupModalVisible(true);
  };

  const handleEditElementGroup = (group: TemplateTypes.ElementGroup, subsection: TemplateTypes.Subsection) => {
    setCurrentEditingSubsection(subsection);
    setCurrentEditingElementGroup(group);
    elementGroupForm.setFieldsValue({ elementGroupName: group.name });
    setIsElementGroupModalVisible(true);
  };

  const handleSaveElementGroup = (values: { elementGroupName: string }) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      let updatedSubsection: TemplateTypes.Subsection | null = null; // To hold the updated subsection
      const updatedSections = prevTemplate.sections.map(sec => {
        const updatedSubsections = sec.subsections.map(sub => {
          if (sub.id === currentEditingSubsection?.id) {
            let finalElementGroups: TemplateTypes.ElementGroup[];
            if (currentEditingElementGroup) {
              // Edit existing group
              finalElementGroups = sub.elementGroups.map(group =>
                group.id === currentEditingElementGroup.id ? { ...group, name: values.elementGroupName } : group
              );
            } else {
              // Add new group
              const newElementGroup: TemplateTypes.ElementGroup = {
                id: generateUniqueId('eg-'),
                name: values.elementGroupName,
                interactiveElements: [], // Initialize with empty array
              };
              finalElementGroups = [...sub.elementGroups, newElementGroup];
            }
            updatedSubsection = { ...sub, elementGroups: finalElementGroups };
            return updatedSubsection;
          }
          return sub;
        });
        return { ...sec, subsections: updatedSubsections };
      });

      // Update selectedItem after the template state has been updated
      if (updatedSubsection) {
        setSelectedItem(updatedSubsection);
      }
      return { ...prevTemplate, sections: updatedSections };
    });
    setIsElementGroupModalVisible(false);
    elementGroupForm.resetFields();
  };

  const handleDeleteElementGroup = (subsectionId: string, elementGroupId: string) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      const updatedSections = prevTemplate.sections.map(sec => {
        const updatedSubsections = sec.subsections.map(sub => {
          if (sub.id === subsectionId) {
            const updatedElementGroups = sub.elementGroups.filter(group => group.id !== elementGroupId);
            return { ...sub, elementGroups: updatedElementGroups };
          }
          return sub;
        });
        return { ...sec, subsections: updatedSubsections };
      });
      return { ...prevTemplate, sections: updatedSections };
    });
    setSelectedItem(null); // Clear selection if deleted
  };

  // --- Handlers for Interactive Elements (now managed by NestedInteractiveElementEditor) ---
  const handleInteractiveElementsChange = (elementGroupId: string, newElements: TemplateTypes.InteractiveElement[]) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate) return null;
      let updatedSubsection: TemplateTypes.Subsection | null = null;
      const updatedSections = prevTemplate.sections.map(sec => {
        const updatedSubsections = sec.subsections.map(sub => {
          if (sub.id === currentEditingSubsection?.id) {
            const updatedElementGroups = sub.elementGroups.map(group => {
              if (group.id === elementGroupId) {
                return { ...group, interactiveElements: newElements };
              }
              return group;
            });
            updatedSubsection = { ...sub, elementGroups: updatedElementGroups };
            return updatedSubsection;
          }
          return sub;
        });
        return { ...sec, subsections: updatedSubsections };
      });

      if (updatedSubsection) {
        setSelectedItem(updatedSubsection);
      }
      return { ...prevTemplate, sections: updatedSections };
    });
  };

  // --- Render Helpers ---
  const renderSectionOrSubsection = (item: TemplateTypes.Section | TemplateTypes.Subsection, parentSectionId?: string) => (
    <List.Item
      key={item.id}
      onClick={() => setSelectedItem(item)}
      style={{
        cursor: 'pointer',
        backgroundColor: selectedItem?.id === item.id ? '#e6f7ff' : 'transparent',
        padding: '8px 0',
      }}
      actions={[
        'subsections' in item ? (
          <Button
            key="add-subsection"
            type="link"
            icon={<PlusOutlined />}
            onClick={e => {
              e.stopPropagation();
              handleAddSubsection(item.id);
            }}
          >
            Subseção
          </Button>
        ) : (
          <Button
            key="add-element-group"
            type="link"
            icon={<PlusOutlined />}
            onClick={e => {
              e.stopPropagation();
              handleAddElementGroup(item as TemplateTypes.Subsection);
            }}
          >
            Grupo
          </Button>
        ),
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={e => {
            e.stopPropagation();
            'subsections' in item ? handleEditSection(item) : handleEditSubsection(template.sections.find(s => s.id === parentSectionId)!, item as TemplateTypes.Subsection);
          }}
        />,
        <Popconfirm
          key="delete"
          title="Tem certeza que deseja apagar?"
          onConfirm={e => {
            e?.stopPropagation();
            'subsections' in item ? handleDeleteSection(item.id) : handleDeleteSubsection(parentSectionId!, item.id);
          }}
          okText="Sim"
          cancelText="Não"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={e => e.stopPropagation()}
          />
        </Popconfirm>,
      ]}
    >
      <Text strong>{item.name}</Text> ({'subsections' in item ? 'Seção' : 'Subseção'})
    </List.Item>
  );

  const renderElementGroup = (group: TemplateTypes.ElementGroup, subsection: TemplateTypes.Subsection) => (
    <Card
      key={group.id}
      title={group.name}
      size="small"
      style={{ marginBottom: 16 }}
      extra={
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditElementGroup(group, subsection)} />
          <Popconfirm
            title="Tem certeza que deseja apagar?"
            onConfirm={() => handleDeleteElementGroup(subsection.id, group.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      }
    >
      <Text strong>Elementos Interativos:</Text>
      <NestedInteractiveElementEditor
        elements={group.interactiveElements}
        onElementsChange={(newElements) => handleInteractiveElementsChange(group.id, newElements)}
      />
    </Card>
  );

  const onFinish = (values: TemplateTypes.Template) => {
    // Update top-level template properties from main form
    const finalTemplate = { ...template, ...values };
    console.log('Final Template Object:', JSON.stringify(finalTemplate, null, 2));
    // In a real app, you would send finalTemplate to your backend API
    // navigate('/admin/templates'); // Redirect after save
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <h1>{id ? 'Editar Modelo de Laudo' : 'Criar Novo Modelo de Laudo'}</h1>
      <Form
        form={mainForm}
        layout="vertical"
        onFinish={onFinish}
        initialValues={template as TemplateTypes.Template}
      >
        <Row gutter={16} style={{ height: 'calc(100vh - 180px)' }}>
          <Col span={12} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card title="Informações Básicas do Modelo" style={{ flex: 0, marginBottom: 16 }}>
              <Form.Item name="name" label="Nome do Modelo" rules={[{ required: true, message: 'Por favor, insira o nome do modelo!' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="reportTitle" label="Título do Laudo" rules={[{ required: true, message: 'Por favor, insira o título do laudo!' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="modality" label="Modalidade" rules={[{ required: true, message: 'Por favor, selecione a modalidade!' }]}>
                <Select placeholder="Selecione a modalidade">
                  <SelectOption value="RM">Ressonância Magnética</SelectOption>
                  <SelectOption value="TC">Tomografia Computadorizada</SelectOption>
                  <SelectOption value="US">Ultrassonografia</SelectOption>
                  <SelectOption value="CR">Radiografia</SelectOption>
                  <SelectOption value="DX">Densitometria Óssea</SelectOption>
                  <SelectOption value="MG">Mamografia</SelectOption>
                </Select>
              </Form.Item>
            </Card>

            <Card title="Estrutura do Laudo (Seções e Subseções)" style={{ flex: 1, overflowY: 'auto', marginTop: 0 }}>
              <List
                bordered
                dataSource={template.sections}
                renderItem={(section: TemplateTypes.Section) => (
                  <>
                    {renderSectionOrSubsection(section)}
                    {section.subsections && section.subsections.length > 0 && (
                      <List
                        dataSource={section.subsections}
                        renderItem={(subsection: TemplateTypes.Subsection) => (
                          <div style={{ marginLeft: 20 }}>
                            {renderSectionOrSubsection(subsection, section.id)}
                          </div>
                        )}
                      />
                    )}
                  </>
                )}
              />
              <Button type="dashed" onClick={handleAddSection} block icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                Adicionar Seção
              </Button>
            </Card>
          </Col>

          <Col span={12} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card title="Detalhes do Item Selecionado" style={{ flex: 1, overflowY: 'auto', minHeight: '400px' }}>
              {selectedItem && 'elementGroups' in selectedItem ? (
                <div>
                  <h3>Detalhes da Subseção: {selectedItem.name}</h3>
                  <h4>Grupos de Elementos Interativos:</h4>
                  <List
                    bordered
                    dataSource={selectedItem.elementGroups}
                    renderItem={(group: TemplateTypes.ElementGroup) => renderElementGroup(group, selectedItem as TemplateTypes.Subsection)}
                  />
                  <Button
                    type="dashed"
                    onClick={() => handleAddElementGroup(selectedItem as TemplateTypes.Subsection)}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: 8 }}
                  >
                    Adicionar Grupo de Elementos
                  </Button>
                </div>
              ) : selectedItem && 'subsections' in selectedItem ? (
                <div>
                  <h3>Detalhes da Seção: {selectedItem.name}</h3>
                  <p>Selecione uma subseção dentro desta seção para editar seus elementos.</p>
                </div>
              ) : (
                <p>Selecione uma seção ou subseção na coluna esquerda para ver os detalhes.</p>
              )}
            </Card>
          </Col>
        </Row>
        <Form.Item style={{ marginTop: 16 }}>
          <Button type="primary" htmlType="submit">
            Salvar Modelo
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/templates')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>

      {/* Section Modal */}
      <Modal
        title={currentEditingSection ? 'Editar Seção' : 'Adicionar Nova Seção'}
        open={isSectionModalVisible}
        onOk={() => sectionForm.submit()} // Use sectionForm.submit()
        onCancel={() => {
          setIsSectionModalVisible(false);
          sectionForm.resetFields();
        }}
      >
        <Form form={sectionForm} layout="vertical" onFinish={handleSaveSection}>
          <Form.Item name="sectionName" label="Nome da Seção" rules={[{ required: true, message: 'Por favor, insira o nome da seção!' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Subsection Modal */}
      <Modal
        title={currentEditingSubsection ? 'Editar Subseção' : 'Adicionar Nova Subseção'}
        open={isSubsectionModalVisible}
        onOk={() => subsectionForm.submit()} // Use subsectionForm.submit()
        onCancel={() => {
          setIsSubsectionModalVisible(false);
          subsectionForm.resetFields();
        }}
      >
        <Form form={subsectionForm} layout="vertical" onFinish={handleSaveSubsection}>
          <Form.Item name="subsectionName" label="Nome da Subseção" rules={[{ required: true, message: 'Por favor, insira o nome da subseção!' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Element Group Modal */}
      <Modal
        title={currentEditingElementGroup ? 'Editar Grupo de Elementos' : 'Adicionar Novo Grupo de Elementos'}
        open={isElementGroupModalVisible}
        onOk={() => elementGroupForm.submit()} // Use elementGroupForm.submit()
        onCancel={() => {
          setIsElementGroupModalVisible(false);
          elementGroupForm.resetFields();
        }}
      >
        <Form form={elementGroupForm} layout="vertical" onFinish={handleSaveElementGroup}>
          <Form.Item name="elementGroupName" label="Nome do Grupo de Elementos" rules={[{ required: true, message: 'Por favor, insira o nome do grupo!' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateEditorAdminPage;