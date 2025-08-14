import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner, // Importamos o spinner para feedback visual
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

// 1. Importar nosso hook useAuth para acessar o contexto
import { useAuth } from '../../../context/AuthContext' // Verifique se o caminho está correto

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) // Estado para controlar o loading

  // 2. Obter a função de login do nosso contexto
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true) // Ativa o loading

    try {
      // 3. Chamar a função de login do contexto
      // A função retorna `true` em caso de sucesso ou `false` em caso de falha.
      const success = await login(email, password)

      if (!success) {
        // A lógica do contexto já tratou o erro, aqui apenas mostramos a mensagem.
        setError('Credenciais inválidas. Por favor, tente novamente.')
      }
      // Não precisamos mais do navigate('/') aqui, o contexto já faz isso!
    } catch (err) {
      // Este catch é uma segurança extra, mas a lógica principal está no contexto.
      setError('Ocorreu um erro inesperado. Tente novamente.')
      console.error('Erro inesperado na página de login:', err)
    } finally {
      setLoading(false) // Desativa o loading, tanto em sucesso quanto em falha
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Entre na sua conta</p>
                    {error && <div className="text-danger mb-3">{error}</div>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Email"
                        autoComplete="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading} // Desabilita o campo durante o loading
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Senha"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading} // Desabilita o campo durante o loading
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4" disabled={loading}>
                          {loading ? <CSpinner size="sm" /> : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <CButton color="link" className="px-0" disabled={loading}>
                          Esqueceu a senha?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Cadastro</h2>
                    <p>Se você ainda não tem uma conta, clique abaixo para se registrar.</p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Cadastre-se agora!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login