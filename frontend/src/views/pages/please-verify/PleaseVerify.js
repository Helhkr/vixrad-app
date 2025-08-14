import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCard, 
  CCardBody, 
  CButton, 
  CSpinner, 
  CAlert 
} from '@coreui/react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api'; // Importe sua instância do axios/api

const PleaseVerify = () => {
  const { user, logout, refreshUserStatus } = useAuth();
  const navigate = useNavigate();

  // Estados para controlar o loading e as mensagens de feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Hook para a verificação automática ao focar na aba
  useEffect(() => {
    const handleFocus = async () => {
      if (!document.hidden) {
        const updatedUser = await refreshUserStatus();
        if (updatedUser?.is_email_verified) {
          navigate('/');
        }
      }
    };

    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshUserStatus, navigate]);

  // Função para lidar com o clique no botão de reenvio
  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await api.post('/api/auth/resend-verification');
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao reenviar o e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCard>
              <CCardBody className="text-center p-5">
                <h2>Verificação Necessária</h2>
                <p className="text-medium-emphasis">
                  Enviamos um link de verificação para o e-mail <strong>{user?.email}</strong>.
                </p>
                <p>Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.</p>

                {/* Exibe alertas de sucesso ou erro */}
                {message && <CAlert color="success" className="mt-3">{message}</CAlert>}
                {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

                {/* Botão de Reenvio Reintegrado */}
                <CButton color="primary" onClick={handleResend} disabled={loading} className="mt-3 mx-2">
                  {loading ? <CSpinner size="sm" /> : 'Reenviar E-mail de Verificação'}
                </CButton>
                <CButton color="secondary" onClick={logout} className="mt-3 mx-2">
                  Sair
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default PleaseVerify;