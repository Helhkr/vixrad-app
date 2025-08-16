import React from 'react';
import { Button, Input, Typography, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

interface ReportPreviewProps {
  reportText: string;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ reportText }) => {
  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    // You might want to add a notification here, e.g., message.success('Laudo copiado!');
    alert('Laudo copiado para a área de transferência!');
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Pré-visualização do Laudo</Title>
        <Button icon={<CopyOutlined />} onClick={handleCopyReport}>
          Copiar Laudo
        </Button>
      </div>
      <TextArea
        value={reportText}
        rows={20} // Adjust rows as needed
        readOnly
        style={{ width: '100%', resize: 'none' }}
      />
      {/* 
        TODO: Integrate Editor.js here instead of TextArea.
        This would involve initializing Editor.js with the reportText
        and handling its data format.
      */}
    </Space>
  );
};