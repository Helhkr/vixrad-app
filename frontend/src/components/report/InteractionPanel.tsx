import React, { memo } from 'react'; // Adicionado memo
import { Button, Checkbox, Space, Typography, Card } from 'antd';
import type { ElementGroup } from '../../types/template';
import type { SelectedOptions } from '../../types/template';
import { DebouncedTextArea } from '../common/DebouncedTextArea';

const { Text } = Typography;

interface InteractionPanelProps {
  elementGroups: ElementGroup[];
  selectedOptions: SelectedOptions;
  onOptionChange: (elementId: string, value: string | string[]) => void;
}

export const InteractionPanel: React.FC<InteractionPanelProps> = memo(({
  elementGroups,
  selectedOptions,
  onOptionChange,
}) => {
  const isOptionSelected = (optionId: string): boolean => {
    for (const elementId in selectedOptions) {
      const value = selectedOptions[elementId];
      if (Array.isArray(value)) {
        if (value.includes(optionId)) return true;
      } else if (value === optionId) {
        return true;
      }
    }
    return false;
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {elementGroups.map(group => {
        const isGroupVisible = group.actionRule
          ? isOptionSelected(group.actionRule.triggerOptionId)
          : true;

        if (!isGroupVisible) {
          return null; // Do not render if action rule is not met
        }

        return (
          <Card key={group.id} title={group.name} style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {group.interactiveElements.map(element => (
                <div key={element.id} style={{ width: '100%' }}>
                  <Text strong>{element.label}</Text>
                  {element.type === 'BUTTON_GROUP' && element.options && (
                    <Space.Compact style={{ marginTop: '8px' }}>
                      {element.options.map(option => (
                        <Button
                          key={option.id}
                          type={selectedOptions[element.id] === option.id ? 'primary' : 'default'}
                          onClick={() => onOptionChange(element.id, option.id)}
                        >
                          {option.value}
                        </Button>
                      ))}
                    </Space.Compact>
                  )}
                  {element.type === 'CHECKBOX' && element.options && (
                    <Checkbox.Group
                      style={{ width: '100%', marginTop: '8px' }}
                      value={selectedOptions[element.id] as string[] || []}
                      onChange={(checkedValues) => onOptionChange(element.id, checkedValues as string[])}
                    >
                      <Space direction="vertical">
                        {element.options.map(option => (
                          <Checkbox key={option.id} value={option.id}>
                            {option.value}
                          </Checkbox>
                        ))}
                      </Space>
                    </Checkbox.Group>
                  )}
                  {element.type === 'TEXT_AREA' && (
                    <DebouncedTextArea
                      rows={4}
                      placeholder={element.placeholder}
                      value={selectedOptions[element.id] as string || ''}
                      onChange={(value) => onOptionChange(element.id, value)}
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </div>
              ))}
            </Space>
          </Card>
        );
      })}
    </Space>
  );
}); // Fechamento do memo