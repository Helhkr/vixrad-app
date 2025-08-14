import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CButton, 
  CListGroup, 
  CListGroupItem,
  CSpinner
} from '@coreui/react';
import api from '../../api';

const TemplateEditor = () => {
  const { reportId } = useParams(); // O ID da rota agora é o ID do laudo
  const [report, setReport] = useState(null);
  const [reportData, setReportData] = useState({}); // Objeto para mapear sectionId -> content
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Função para buscar os dados do laudo
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reports/${reportId}`);
      setReport(response.data);

      // Transforma o array reportData em um mapa para fácil acesso
      const dataMap = response.data.reportData.reduce((acc, data) => {
        acc[data.section_id] = data.content;
        return acc;
      }, {});
      setReportData(dataMap);

    } catch (err) {
      console.error('Erro ao buscar o laudo:', err);
      setError('Não foi possível carregar o laudo.');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Função para lidar com o clique no botão de ação (placeholder)
  const handleActionClick = async (sourceActionId) => {
    console.log(`Ação disparada: ${sourceActionId}`);
    try {
      const response = await api.post('/api/reports/evaluate-action', {
        templateId: report.template.id,
        sourceActionId: sourceActionId,
      });

      console.log('API de avaliação respondeu:', response.data);
      
      // Lógica para atualizar o estado reportData com a resposta
      const newReportData = { ...reportData };
      response.data.updates.forEach(update => {
        newReportData[update.targetSectionId] = update.actionText;
      });
      setReportData(newReportData);

    } catch (err) {
      console.error('Erro ao avaliar a ação:', err);
    }
  };

  // Renderiza o conteúdo completo do laudo para a coluna 3
  const renderFinalReport = () => {
    if (!report) return '';
    // Ordena as seções e busca o conteúdo do estado reportData
    return report.template.sections
      .sort((a, b) => a.display_order - b.display_order)
      .map(section => `## ${section.title}\n${reportData[section.id] || ''}`)
      .join('\n\n');
  };

  if (loading) {
    return <div className="pt-3 text-center"><CSpinner /></div>;
  }

  if (error) {
    return <div className="pt-3 text-center text-danger">{error}</div>;
  }

  return (
    <CContainer fluid>
      <CRow>
        {/* Coluna 1: Seções */}
        <CCol md={3}>
          <CCard>
            <CCardHeader>Seções do Laudo</CCardHeader>
            <CCardBody>
              <CListGroup>
                {report.template.sections.map((section) => (
                  <CListGroupItem key={section.id} component="a" href={`#section-${section.id}`}>
                    {section.title}
                  </CListGroupItem>
                ))}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Coluna 2: Opções Interativas */}
        <CCol md={4}>
          <CCard>
            <CCardHeader>Opções Dinâmicas</CCardHeader>
            <CCardBody>
              <p>Clique em um botão para ver a mágica:</p>
              <CButton 
                color="primary" 
                className="mb-2"
                onClick={() => handleActionClick('nodulo_benigno_clique')}
              >
                Nódulo Benigno
              </CButton>
              {/* Adicione mais botões de teste aqui conforme necessário */}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Coluna 3: Laudo Final */}
        <CCol md={5}>
          <CCard>
            <CCardHeader>Laudo Final</CCardHeader>
            <CCardBody>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {renderFinalReport()}
              </pre>
              <CButton color="primary" className="mt-3">Copiar Laudo</CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default TemplateEditor;

