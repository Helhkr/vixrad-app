import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons';

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateReportFromTemplate = async (templateId) => {
    try {
      const response = await api.post('/api/reports', { templateId });
      const newReport = response.data;
      navigate(`/laudos/editor/${newReport.id}`);
    } catch (err) {
      console.error("Erro ao criar o laudo:", err);
      setError("Não foi possível criar um novo laudo a partir deste modelo.");
    }
  };

  const handleCreateNewTemplate = () => {
    navigate('/laudos/templates/new');
  };

  const handleEditTemplate = (templateId) => {
    navigate(`/laudos/templates/edit/${templateId}`);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo de laudo?')) {
      try {
        await api.deleteTemplate(templateId);
        fetchTemplates(); // Refresh the list after deletion
      } catch (err) {
        console.error("Erro ao excluir o modelo de laudo:", err);
        setError("Não foi possível excluir o modelo de laudo.");
      }
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
          <CCol xs="auto">
            <CButton color="primary" className="float-end" onClick={handleCreateNewTemplate}>
              <CIcon icon={cilPlus} className="me-2" />
              Novo Modelo
            </CButton>
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
                      onClick={() => handleCreateReportFromTemplate(template.id)}
                      className="me-2"
                    >
                      Criar Laudo
                    </CButton>
                    <CButton 
                      color="info" 
                      size="sm"
                      onClick={() => handleEditTemplate(template.id)}
                      className="me-2"
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton 
                      color="danger" 
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <CIcon icon={cilTrash} />
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