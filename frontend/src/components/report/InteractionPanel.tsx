import React, { memo } from 'react';
import { Button, Checkbox, Space, Typography, Card, Input, InputNumber, Segmented } from 'antd';
import * as TemplateTypes from '../../types/template';
import { DebouncedTextArea } from '../common/DebouncedTextArea';

const { Text } = Typography;

interface InteractionPanelProps {
  elementGroups: TemplateTypes.ElementGroup[];
  selectedOptions: TemplateTypes.SelectedOptions;
  onOptionChange: (elementId: string, value: string | string[]) => void;
  // New prop for handling nested option changes
  onNestedOptionChange: (parentId: string, elementId: string, value: string | string[]) => void;
}

// Recursive component to render interactive elements
const InteractiveElementRenderer: React.FC<{
  element: TemplateTypes.InteractiveElement;
  selectedOptions: TemplateTypes.SelectedOptions;
  onOptionChange: (elementId: string, value: string | string[]) => void;
  onNestedOptionChange: (parentId: string, elementId: string, value: string | string[]) => void;
}> = memo(({ element, selectedOptions, onOptionChange, onNestedOptionChange }) => {
  const handleOptionChange = (value: string | string[]) => {
    onOptionChange(element.id, value);
  };

  const handleChildOptionChange = (childElementId: string, childValue: string | string[]) => {
    onNestedOptionChange(element.id, childElementId, childValue);
  };

  // Determine if the element should be visible.
  // For now, we assume all elements passed to this renderer are meant to be visible.
  // Visibility logic for top-level elements will be in InteractionPanel,
  // and for nested elements, it's based on parent option selection.

  return (
    <div key={element.id} style={{ width: '100%', marginBottom: 16 }}>
      {element.label && <Text strong>{element.label}</Text>}
      {element.type === 'SEGMENTED' && element.options && (
        <Segmented
          options={element.options.map(opt => ({ label: opt.label, value: opt.id }))}
          value={selectedOptions[element.id] as string || undefined}
          onChange={(value) => {
            handleOptionChange(value as string);
            // Clear child elements if the selected option changes and the new option doesn't have the same children
            const previouslySelectedOptionId = selectedOptions[element.id] as string;
            const previouslySelectedOption = element.options?.find(opt => opt.id === previouslySelectedOptionId);

            const newlySelectedOption = element.options?.find(opt => opt.id === value);

            // If the selected option changes and the new option has different child elements, clear the old ones
            if (previouslySelectedOption && previouslySelectedOption.childElements &&
                (!newlySelectedOption || !newlySelectedOption.childElements ||
                 newlySelectedOption.childElements.some(newChild => !previouslySelectedOption.childElements?.some(oldChild => oldChild.id === newChild.id)))) {
                // This is a simplified clear. A more robust solution would recursively clear all children.
                // For now, we'll rely on the parent component to manage the overall state.
                // The onOptionChange will handle clearing the direct child if the parent changes.
            }
          }}
          style={{ marginTop: '8px' }}
        />
      )}
      {/* Render child elements for SEGMENTED if an option is selected and has children */}
      {element.type === 'SEGMENTED' && element.options &&
        selectedOptions[element.id] &&
        element.options.find(opt => opt.id === selectedOptions[element.id])?.childElements &&
        (element.options.find(opt => opt.id === selectedOptions[element.id])?.childElements?.length || 0) > 0 && (
          <div style={{ marginLeft: 20, marginTop: 10, borderLeft: '2px solid #f0f0f0', paddingLeft: 10 }}>
            {(element.options.find(opt => opt.id === selectedOptions[element.id])?.childElements || []).map(childElement => (
              <InteractiveElementRenderer
                key={childElement.id}
                element={childElement}
                selectedOptions={selectedOptions}
                onOptionChange={handleChildOptionChange}
                onNestedOptionChange={onNestedOptionChange}
              />
            ))}
          </div>
        )}
      {element.type === 'CHECKBOX' && element.options && (
        <Checkbox.Group
          style={{ width: '100%', marginTop: '8px' }}
          value={selectedOptions[element.id] as string[] || []}
          onChange={(checkedValues) => {
            handleOptionChange(checkedValues as string[]);
            // For checkboxes, we might need to iterate through selected values
            // to see which child elements to render. This is more complex.
            // For simplicity, let's assume child elements are revealed if *any*
            // of the parent options with child elements are selected.
          }}
        >
          <Space direction="vertical">
            {element.options.map(option => (
              <div key={option.id}>
                <Checkbox value={option.id}>
                  {option.label}
                </Checkbox>
                {/* Render child elements if this option is selected and has children */}
                {(Array.isArray(selectedOptions[element.id]) && (selectedOptions[element.id] as string[]).includes(option.id)) &&
                 option.childElements && option.childElements.length > 0 && (
                  <div style={{ marginLeft: 20, marginTop: 10, borderLeft: '2px solid #f0f0f0', paddingLeft: 10 }}>
                    {option.childElements.map(childElement => (
                      <InteractiveElementRenderer
                        key={childElement.id}
                        element={childElement}
                        selectedOptions={selectedOptions} // Pass down current selected options
                        onOptionChange={handleChildOptionChange} // Pass a handler for nested changes
                        onNestedOptionChange={onNestedOptionChange} // Pass down for deeper nesting
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Space>
        </Checkbox.Group>
      )}
      {element.type === 'INPUT_NUMBER' && (
        <InputNumber
          placeholder={element.placeholder}
          value={selectedOptions[element.id] as number || undefined}
          onChange={(value) => handleOptionChange(value !== null ? String(value) : '')}
          style={{ width: '100%', marginTop: '8px' }}
        />
      )}
      {element.type === 'TEXT_AREA' && (
        <DebouncedTextArea
          rows={4}
          placeholder={element.placeholder}
          value={selectedOptions[element.id] as string || ''}
          onChange={(value) => handleOptionChange(value)}
          style={{ marginTop: '8px' }}
        />
      )}
    </div>
  );
});

export const InteractionPanel: React.FC<InteractionPanelProps> = memo(({
  elementGroups,
  selectedOptions,
  onOptionChange,
  onNestedOptionChange,
}) => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {elementGroups.map(group => {
        return (
          <Card key={group.id} title={group.name} style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {group.interactiveElements.map(element => (
                <InteractiveElementRenderer
                  key={element.id}
                  element={element}
                  selectedOptions={selectedOptions}
                  onOptionChange={onOptionChange}
                  onNestedOptionChange={onNestedOptionChange}
                />
              ))}
            </Space>
          </Card>
        );
      })}
    </Space>
  );
});
