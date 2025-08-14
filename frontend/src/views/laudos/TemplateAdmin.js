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
  CFormInput,
  CButtonGroup,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons';

const TemplateAdmin = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  // Dummy categories for now
  const allCategories = [
    { id: '1', name: 'Ultrassonografia' },
    { id: '2', name: 'Tomografia' },
    { id: '3', name: 'Ressonância' },
    { id: '4', name: 'Raio-X' },
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // In a real scenario, this API call would include search and category filters
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

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };

  const handleEditTemplate = (templateId) => {
    navigate(`/laudos/editor/${templateId}`); // Assuming editor can handle template editing
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo de laudo?')) {
      try {
        await api.delete(`/api/templates/${templateId}`);
        setTemplates(templates.filter((template) => template.id !== templateId));
      } catch (err) {
        setError("Não foi possível excluir o modelo de laudo.");
        console.error(err);
      }
    }
  };

  const handleCreateNewTemplate = () => {
    navigate('/laudos/editor/new'); // Navigate to a new template creation page
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      (template.category && selectedCategories.includes(template.category.id));
    return matchesSearch && matchesCategory;
  });

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
          <CCol xs={12} md={6}>
            <strong>Gerenciar Modelos de Laudos</strong>
          </CCol>
          <CCol xs={12} md={6} className="text-md-end mt-2 mt-md-0">
            <CButton color="primary" onClick={handleCreateNewTemplate}>
              <CIcon icon={cilPlus} className="me-2" />
              Novo Modelo
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CCol xs={12} md={8}>
            <CFormInput
              type="text"
              placeholder="Pesquisar modelos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CCol>
          <CCol xs={12} md={4} className="d-flex justify-content-end">
            <CButtonGroup className="flex-wrap">
              {allCategories.map((category) => (
                <CButton
                  key={category.id}
                  color={selectedCategories.includes(category.id) ? 'primary' : 'secondary'}
                  onClick={() => handleCategoryToggle(category.id)}
                  className="mb-1"
                >
                  {category.name}
                </CButton>
              ))}
            </CButtonGroup>
          </CCol>
        </CRow>

        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Nome do Modelo</CTableHeaderCell>
              <CTableHeaderCell scope="col">Categoria</CTableHeaderCell>
              <CTableHeaderCell scope="col">Ações</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <CTableRow key={template.id}>
                  <CTableDataCell>{template.name}</CTableDataCell>
                  <CTableDataCell>{template.category?.name || 'Sem categoria'}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditTemplate(template.id)}
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
                  Nenhum modelo de laudo encontrado com os filtros aplicados.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default TemplateAdmin;
