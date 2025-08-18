import React, { useEffect, useState } from 'react';
import { Table, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAllTemplates } from '../../api/templateService';
import * as TemplateTypes from '../../types/template';

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getAllTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const columns = [
    {
      title: 'Nome do Modelo',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Modalidade',
      dataIndex: 'modality',
      key: 'modality',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Template) => (
        <Space size="middle">
          <Button onClick={() => navigate(`/admin/templates/editar/${record.id}`)}>Editar</Button>
          <Button danger>Apagar</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Gestão de Modelos de Laudo</h1>
      <Button
        type="primary"
        onClick={() => navigate('/admin/templates/novo')}
        style={{ marginBottom: 16 }}
      >
        Criar Novo Modelo
      </Button>
      <Table columns={columns} dataSource={templates} rowKey="id" loading={loading} />
    </div>
  );
};

export default TemplateListPage;