import React, { useState } from 'react';
import { Form, Input, Select, Button, Space, Checkbox, Modal, Typography, Popconfirm, List, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as TemplateTypes from '../../types/template';

const { Option: SelectOption } = Select;
const { Text } = Typography;

const generateUniqueId = (prefix: string = 'id-') => {
  return prefix + Math.random().toString(36).substr(2, 9);
};

interface NestedInteractiveElementEditorProps {
  elements: TemplateTypes.InteractiveElement[];
  onElementsChange: (newElements: TemplateTypes.InteractiveElement[]) => void;
}

const NestedInteractiveElementEditor: React.FC<NestedInteractiveElementEditorProps> = ({
  elements,
  onElementsChange,
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentEditingElement, setCurrentEditingElement] = useState<TemplateTypes.InteractiveElement | null>(null);

  const handleAddElement = () => {
    setCurrentEditingElement(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditElement = (element: TemplateTypes.InteractiveElement) => {
    setCurrentEditingElement(element);
    form.setFieldsValue({
      elementLabel: element.label,
      elementType: element.type,
      elementPlaceholder: element.placeholder,
      isVisibleByDefault: element.isVisibleByDefault,
      elementOptions: element.options,
    });
    setIsModalVisible(true);
  };

  const handleSaveElement = (values: {
    elementLabel?: string;
    elementType: TemplateTypes.InteractiveElement['type'];
    elementPlaceholder?: string;
    elementOptions?: TemplateTypes.Option[];
    isVisibleByDefault: boolean;
  }) => {
    let updatedElements: TemplateTypes.InteractiveElement[];
    if (currentEditingElement) {
      updatedElements = elements.map(el =>
        el.id === currentEditingElement.id
          ? {
              ...el,
              label: values.elementLabel,
              type: values.elementType,
              placeholder: values.elementPlaceholder,
              options: values.elementOptions,
              isVisibleByDefault: values.isVisibleByDefault,
            }
          : el
      );
    } else {
      const newElement: TemplateTypes.InteractiveElement = {
        id: generateUniqueId('ie-'),
        label: values.elementLabel,
        type: values.elementType,
        placeholder: values.elementPlaceholder,
        options: values.elementOptions,
        isVisibleByDefault: values.isVisibleByDefault,
      };
      updatedElements = [...elements, newElement];
    }
    onElementsChange(updatedElements);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDeleteElement = (elementId: string) => {
    const updatedElements = elements.filter(el => el.id !== elementId);
    onElementsChange(updatedElements);
  };

  // Recursive rendering for child elements
  const handleChildElementsChange = (optionId: string, newChildElements: TemplateTypes.InteractiveElement[]) => {
    const updatedElements = elements.map(el => {
      if (el.options) {
        const updatedOptions = el.options.map(opt =>
          opt.id === optionId ? { ...opt, childElements: newChildElements } : opt
        );
        return { ...el, options: updatedOptions };
      }
      return el;
    });
    onElementsChange(updatedElements);
  };

  return (
    <div>
      <List
        bordered
        dataSource={elements}
        renderItem={element => (
          <List.Item
            actions={[
              <Button type="link" icon={<EditOutlined />} onClick={() => handleEditElement(element)} />,
              <Popconfirm
                title="Tem certeza que deseja apagar?"
                onConfirm={() => handleDeleteElement(element.id)}
                okText="Sim"
                cancelText="Não"
              >
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>,
            ]}
          >
            <Text>{element.label || '(Sem Label)'} ({element.type}) {element.isVisibleByDefault ? '' : '(Oculto por padrão)'}</Text>
            {/* Render nested elements if available */}
            {element.options && (element.type === 'SEGMENTED' || element.type === 'CHECKBOX') && (
              <div style={{ marginTop: 10, borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
                {element.options.map(option => (
                  <div key={option.id} style={{ marginBottom: 10, paddingLeft: 20 }}>
                    <Text strong>Opção "{option.value}" - Elementos Aninhados:</Text>
                    <NestedInteractiveElementEditor
                      elements={option.childElements || []}
                      onElementsChange={(newChildElements) => handleChildElementsChange(option.id, newChildElements)}
                    />
                  </div>
                ))}
              </div>
            )}
          </List.Item>
        )}
      />
      <Button type="dashed" onClick={handleAddElement} block icon={<PlusOutlined />} style={{ marginTop: 8 }}>
        Adicionar Elemento Interativo
      </Button>

      <Modal
        title={currentEditingElement ? 'Editar Elemento Interativo' : 'Adicionar Novo Elemento Interativo'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveElement}>
          <Form.Item name="elementLabel" label="Label do Elemento (opcional)">
            <Input />
          </Form.Item>
          <Form.Item name="elementType" label="Tipo de Elemento" rules={[{ required: true, message: 'Por favor, selecione o tipo!' }]}>
            <Select placeholder="Selecione o tipo">
              <SelectOption value="SEGMENTED">Segmented (Botões de Escolha)</SelectOption>
              <SelectOption value="CHECKBOX">Checkbox</SelectOption>
              <SelectOption value="INPUT_NUMBER">Input de Número</SelectOption>
              <SelectOption value="TEXT_AREA">Área de Texto</SelectOption>
            </Select>
          </Form.Item>

          <Form.Item name="isVisibleByDefault" valuePropName="checked" initialValue={true}>
            <Checkbox>Visível por padrão</Checkbox>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.elementType !== currentValues.elementType}
          >
            {({ getFieldValue }) => {
              const elementType = getFieldValue('elementType');
              if (elementType === 'INPUT_NUMBER' || elementType === 'TEXT_AREA') {
                return (
                  <Form.Item name="elementPlaceholder" label="Placeholder (para Entrada de Texto/Número)">
                    <Input />
                  </Form.Item>
                );
              }
              if (elementType === 'SEGMENTED' || elementType === 'CHECKBOX') {
                return (
                  <Form.List name="elementOptions">
                    {(fields, { add, remove }) => (
                      <>
                        <Text strong>Opções:</Text>
                        {fields.map(({ key, name, ...restField }) => (
                          <Card
                            key={key}
                            size="small"
                            style={{ marginBottom: 16, backgroundColor: '#f9f9f9' }}
                            extra={
                              <Popconfirm
                                title="Tem certeza que deseja apagar esta opção?"
                                onConfirm={() => remove(name)}
                                okText="Sim"
                                cancelText="Não"
                              >
                                <Button type="link" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            }
                          >
                            <Form.Item
                              {...restField}
                              name={[name, 'label']}
                              rules={[{ required: true, message: 'Label da opção é obrigatório' }]}
                              label="Label da Opção"
                            >
                              <Input placeholder="Ex: Sim" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'textToAdd']}
                              label="Texto a ser gerado no laudo (opcional)"
                            >
                              <Input.TextArea rows={2} placeholder="Texto a adicionar ao laudo" />
                            </Form.Item>
                            <Text strong>Controles Aninhados (opcional):</Text>
                            <Form.Item {...restField} name={[name, 'childElements']}>
                              <NestedInteractiveElementEditor
                                elements={form.getFieldValue(['elementOptions', name, 'childElements']) || []}
                                onElementsChange={(newChildElements) => {
                                  const currentOptions = form.getFieldValue('elementOptions');
                                  const updatedOptions = currentOptions.map((opt: TemplateTypes.Option, index: number) =>
                                    index === name ? { ...opt, childElements: newChildElements } : opt
                                  );
                                  form.setFieldsValue({ elementOptions: updatedOptions });
                                }}
                              />
                            </Form.Item>
                          </Card>
                        ))}
                        <Button type="dashed" onClick={() => add({ id: generateUniqueId('opt-'), label: undefined, textToAdd: '', childElements: [] })} block icon={<PlusOutlined />}>
                          Adicionar Opção
                        </Button>
                      </>
                    )}
                  </Form.List>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NestedInteractiveElementEditor;
