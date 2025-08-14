import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import api from '../../api';
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react';

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/api/templates');
        setTemplates(response.data);
      } catch (err) {
        setError("Não foi possível carregar os modelos de laudo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Função para criar um novo laudo e navegar para o editor
  const handleCreateReport = async (templateId) => {
    try {
      // Chama a API para criar um novo laudo
      const response = await api.post('/api/reports', { templateId });
      const newReport = response.data;
      // Navega para a página do editor com o ID do novo laudo
      navigate(`/laudos/editor/${newReport.id}`);
    } catch (err) {
      console.error("Erro ao criar o laudo:", err);
      setError("Não foi possível criar um novo laudo a partir deste modelo.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
        <p className="mt-2">Carregando modelos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-5">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <CCard>
      <CCardHeader>
        <CRow className="align-items-center">
          <CCol>
            <strong>Modelos de Laudos</strong>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Nome do Modelo</CTableHeaderCell>
              <CTableHeaderCell scope="col">Categoria</CTableHeaderCell>
              <CTableHeaderCell scope="col">Ações</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {templates.length > 0 ? (
              templates.map((template) => (
                <CTableRow key={template.id}>
                  <CTableDataCell>{template.name}</CTableDataCell>
                  <CTableDataCell>{template.category?.name || 'Sem categoria'}</CTableDataCell>
                  <CTableDataCell>
                    <CButton 
                      color="primary" 
                      size="sm"
                      onClick={() => handleCreateReport(template.id)}
                    >
                      Criar Laudo
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="3" className="text-center">
                  Nenhum modelo de laudo encontrado.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default TemplateList;