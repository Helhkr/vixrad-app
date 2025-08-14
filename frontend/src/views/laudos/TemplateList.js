import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/admin/templates');
        setTemplates(response.data);
      } catch (err) {
        setError("Não foi possível carregar os modelos de laudo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []); // O array vazio garante que o useEffect rode apenas uma vez, ao montar o componente.

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
          <CCol className="text-end">
            <CButton color="success" size="sm">
              Criar Novo Laudo
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Nome do Laudo</CTableHeaderCell>
              <CTableHeaderCell scope="col">Modalidade</CTableHeaderCell>
              <CTableHeaderCell scope="col">Ações</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {templates.length > 0 ? (
              templates.map((template, index) => (
                <CTableRow key={template.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{template.name}</CTableDataCell>
                  <CTableDataCell>{template.modality}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="primary" size="sm" className="me-2">Editar</CButton>
                    <CButton color="danger" size="sm">Excluir</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="4" className="text-center">
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