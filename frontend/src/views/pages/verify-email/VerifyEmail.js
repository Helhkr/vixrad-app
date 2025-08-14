import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CContainer, CRow, CCol, CCard, CCardBody, CSpinner, CButton } from '@coreui/react';
import api from '../../../api';
import { useAuth } from '../../../context/AuthContext'; // 1. Importar o useAuth

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verificando seu e-mail...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Estado para controlar se houve erro
  const { login } = useAuth(); // 2. Obter a função de login do contexto
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('Token de verificação não encontrado.');
      setLoading(false);
      setError(true);
      return;
    }

    const verifyToken = async () => {
      try {
        // 3. Capturar a resposta da API
        const response = await api.get(`/api/auth/verify-email?token=${token}`);
        setMessage('Seu e-mail foi verificado com sucesso! Redirecionando...');
        setError(false);
        
        // 4. Chamar a função de login com os dados recebidos
        // O AuthContext irá armazenar o token, o usuário e redirecionar.
        if (response.data.accessToken && response.data.user) {
          loginWithToken(response.data.accessToken, response.data.user);
          // O redirecionamento será tratado pelo AuthContext/ProtectedRoute
          // Mas podemos adicionar um fallback caso o usuário permaneça na página
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
            // Caso a API não retorne o esperado, mesmo com sucesso
            throw new Error("Resposta da API inválida após verificação.");
        }

      } catch (err) {
        setMessage(err.response?.data?.message || 'Ocorreu um erro ao verificar seu e-mail. O link pode ser inválido ou já ter sido utilizado.');
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, login, navigate]);

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard>
              <CCardBody className="text-center p-5">
                {loading ? (
                  <>
                    <CSpinner color="primary" />
                    <h4 className="mt-3">{message}</h4>
                  </>
                ) : (
                  <>
                    <h2>{message}</h2>
                    {/* 5. Mostrar o botão apenas se houver erro */}
                    {error && (
                      <Link to="/login">
                        <CButton color="primary" className="mt-3">
                          Ir para o Login
                        </CButton>
                      </Link>
                    )}
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