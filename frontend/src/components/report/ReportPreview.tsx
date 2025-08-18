import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
import { Button, Typography, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';

import type { StructuredReport } from '/home/juanr/vixrad-app/frontend/src/types/template';

interface StructuredReportSubsectionContent {
  id: string;
  name: string;
  paragraphs: string[];
}

interface StructuredReportSectionContent {
  id: string;
  name: string;
  content: StructuredReportSubsectionContent[];
}

const { Title } = Typography;

interface ReportPreviewProps {
  structuredReport: StructuredReport | null;
  activeSubsections: Record<string, boolean>; // New prop
}

export const ReportPreview: React.FC<ReportPreviewProps> = memo(({ structuredReport, activeSubsections }) => { // Destructure new prop
  const editorInstance = useRef<EditorJS | null>(null);
  const editorContainerId = 'editorjs-container';
  const [isEditorReady, setIsEditorReady] = useState(false);
  const lastRenderedBlocksRef = useRef<string>('[]');

  useEffect(() => {
    const holderElement = document.getElementById(editorContainerId);
    if (!holderElement) {
      console.warn('EditorJS holder element not found:', editorContainerId);
      return;
    }

    if (!editorInstance.current) {
      editorInstance.current = new EditorJS({
        holder: editorContainerId,
        readOnly: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          paragraph: Paragraph,
        },
      });

      editorInstance.current.isReady
        .then(() => {
          setIsEditorReady(true);
        })
        .catch((err) => {
          console.error('Editor.js initialization error', err);
        });
    }

    return () => {
      if (editorInstance.current && typeof (editorInstance.current as any).destroy === 'function') {
        (editorInstance.current as any).destroy();
        editorInstance.current = null;
        setIsEditorReady(false);
      }
    };
  }, []);

  useEffect(() => {
    if (!structuredReport || !editorInstance.current || !isEditorReady) {
      return;
    }

    const editorData: OutputData = {
      blocks: [],
      version: '2.28.2',
    };

    // Add report title
    editorData.blocks.push({
      id: `title-${structuredReport.title.replace(/\s/g, '')}`,
      type: 'header',
      data: {
        text: structuredReport.title,
        level: 2,
      },
    });

    // Add sections and subsections, filtering by activeSubsections
    structuredReport.sections.forEach((section: StructuredReportSectionContent) => {
      const activeContent = section.content.filter(subsection => activeSubsections[subsection.id]);

      if (activeContent.length > 0) { // Only add section header if there's active content
        editorData.blocks.push({
          id: `section-${section.id}`,
          type: 'header',
          data: {
            text: section.name + ':',
            level: 3,
          },
        });

        activeContent.forEach((subsection: StructuredReportSubsectionContent) => {
          subsection.paragraphs.forEach((paragraphText: string, index: number) => {
            if (paragraphText.trim() !== '') {
              editorData.blocks.push({
                id: `subsection-${subsection.id}-${index}`,
                type: 'paragraph',
                data: {
                  text: paragraphText,
                },
              });
            }
          });
        });
      }
    });

    const newBlocksJson = JSON.stringify(editorData.blocks);

    if (newBlocksJson !== lastRenderedBlocksRef.current) {
      editorInstance.current.render(editorData)
        .catch((error) => console.error('Editor.js render error:', error));
      lastRenderedBlocksRef.current = newBlocksJson;
    }

  }, [structuredReport, isEditorReady, activeSubsections]); // Added activeSubsections to dependencies

  const handleCopyReport = useCallback(() => {
    if (structuredReport) {
      let fullReportText = structuredReport.title + '\n\n';
      structuredReport.sections.forEach((section: StructuredReportSectionContent) => {
        // Filter content for copying based on activeSubsections
        const activeContentForCopy = section.content.filter(subsection => activeSubsections[subsection.id]);
        if (activeContentForCopy.length > 0) {
          fullReportText += section.name + ':\n';
          activeContentForCopy.forEach((subsection: StructuredReportSubsectionContent) => {
            subsection.paragraphs.forEach((paragraph: string) => {
              fullReportText += paragraph + '\n';
            });
          });
          fullReportText += '\n';
        }
      });
      navigator.clipboard.writeText(fullReportText.trim());
      alert('Laudo copiado para a área de transferência!');
    }
  }, [structuredReport, activeSubsections]); // Added activeSubsections to dependencies

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Pré-visualização do Laudo</Title>
        <Button icon={<CopyOutlined />} onClick={handleCopyReport}>
          Copiar Laudo
        </Button>
      </div>
      <div id={editorContainerId} style={{ border: '1px solid #f0f0f0', minHeight: '300px', padding: '10px' }} />
    </Space>
  );
});
