import React, { useEffect, useState, useMemo } from 'react';
import { Card, Col, Row, Typography, Spin, Alert, Input, Button, Space, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAllTemplates } from '../api/templateService';

const { Title } = Typography;
const { Content } = Layout;

interface TemplateSummary {
  id: string;
  name: string;
  modality: string;
}

const ALL_MODALITIES = ['CR', 'US', 'MR', 'TC']; // Using abbreviations as per mock data

const TemplateSelectionPage: React.FC = () => {
  const [allTemplates, setAllTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedModalities, setSelectedModalities] = useState<string[]>(ALL_MODALITIES);
  const [isInitialFilterState, setIsInitialFilterState] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await getAllTemplates();
        setAllTemplates(data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleCardClick = (templateId: string) => {
    navigate(`/app/laudos/criar/${templateId}`);
  };

  const handleModalityToggle = (modality: string) => {
    setSelectedModalities((prevSelected) => {
      if (isInitialFilterState) {
        setIsInitialFilterState(false);
        return [modality];
      } else {
        const newSelected = prevSelected.includes(modality)
          ? prevSelected.filter((m) => m !== modality)
          : [...prevSelected, modality];

        if (newSelected.length === 0) {
          setIsInitialFilterState(true);
          return ALL_MODALITIES;
        }
        return newSelected;
      }
    });
  };

  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((template) =>
        template.name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().includes(
          searchTerm.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
        )
      );
    }

    // Filter by selected modalities
    // Only apply modality filter if not in initial state or if specific modalities are selected
    if (!isInitialFilterState || (selectedModalities.length > 0 && selectedModalities.length < ALL_MODALITIES.length)) {
      filtered = filtered.filter((template) =>
        selectedModalities.includes(template.modality)
      );
    }

    return filtered;
  }, [allTemplates, searchTerm, selectedModalities, isInitialFilterState]);

  return (
    <Layout style={{ minHeight: '100vh', padding: '20px' }}>
      <Content style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>Selecione um Modelo de Laudo</Title>

        <Card title="Filtrar Modelos" style={{ marginBottom: '30px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Input
              placeholder="Pesquisar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {ALL_MODALITIES.map((modality) => (
                <Button
                  key={modality}
                  type={selectedModalities.includes(modality) ? 'primary' : 'default'}
                  onClick={() => handleModalityToggle(modality)}
                >
                  {modality}
                </Button>
              ))}
            </div>
          </Space>
        </Card>

        {loading && <Spin size="large" tip="Carregando modelos..." style={{ display: 'block', margin: '40px auto' }} />}
        {error && <Alert message="Erro" description={error} type="error" showIcon style={{ marginBottom: '20px' }} />}

        {!loading && !error && filteredTemplates.length === 0 && (
          <Alert message="Nenhum modelo encontrado" description="Não há modelos de laudo disponíveis que correspondam aos seus critérios de filtro." type="info" showIcon />
        )}

        <Row gutter={[24, 24]} justify="center">
          {filteredTemplates.map((template) => (
            <Col key={template.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => handleCardClick(template.id)}
                style={{ width: '100%', height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
              >
                <Title level={4} style={{ margin: 0, textAlign: 'center' }}>{template.name}</Title>
                <p style={{ margin: '10px 0 0', color: '#888' }}>Modalidade: {template.modality}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default TemplateSelectionPage;
