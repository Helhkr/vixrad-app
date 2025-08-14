import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// ADICIONE CButton A ESTA LINHA DE IMPORTAÇÃO
import { CContainer, CRow, CCol, CCard, CCardBody, CSpinner, CButton } from '@coreui/react';
import api from '../../../api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verificando seu e-mail...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('Token de verificação não encontrado.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        await api.get(`/api/auth/verify-email?token=${token}`);
        setMessage('Seu e-mail foi verificado com sucesso! Agora você pode usar todos os recursos da plataforma.');
      } catch (error) {
        setMessage(error.response?.data?.message || 'Ocorreu um erro ao verificar seu e-mail. O link pode ser inválido ou já ter sido utilizado.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  // O restante do seu componente continua igual...
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard>
              <CCardBody className="text-center p-5">
                {loading ? (
                  <CSpinner color="primary" />
                ) : (
                  <>
                    <h2>{message}</h2>
                    <Link to="/login">
                      <CButton color="primary" className="mt-3">
                        Ir para o Login
                      </CButton>
                    </Link>
                  </>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default VerifyEmail;