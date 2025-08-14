import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormFeedback,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilAt, cilCreditCard, cilBriefcase } from '@coreui/icons'
import api from '../../../api'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    repeatPassword: '',
    cpf: '',
    crm: '',
    crm_uf: '',
  })
  const [error, setError] = useState('')
  const [validated, setValidated] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const form = e.currentTarget

    if (form.checkValidity() === false || formData.password !== formData.repeatPassword) {
      e.stopPropagation()
      setValidated(true)
      if (formData.password !== formData.repeatPassword) {
        setError('As senhas não coincidem.')
      } else {
        setError('')
      }
      return
    }

    setValidated(true)
    setError('')

    try {
      // Limpa a formatação do CPF, mantendo apenas os dígitos.
      const cpfLimpo = formData.cpf.replace(/[^\d]/g, '')
      
      const response = await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        // O campo agora é user_cpf para corresponder ao backend
        user_cpf: cpfLimpo,
        crm: formData.crm,
        crm_uf: formData.crm_uf,
      })

      console.log('Registro bem-sucedido:', response.data)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar. Por favor, tente novamente.')
      console.error('Erro de registro:', err.response?.data || err)
    }
  }

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
  ]

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm noValidate validated={validated} onSubmit={handleRegister}>
                  <h1>Registro</h1>
                  <p className="text-body-secondary">Crie sua conta</p>
                  {error && <div className="text-danger mb-3">{error}</div>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      placeholder="Nome completo"
                      autoComplete="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <CFormFeedback invalid>Por favor, informe seu nome.</CFormFeedback>
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <CFormFeedback invalid>Por favor, informe um email válido.</CFormFeedback>
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilCreditCard} /></CInputGroupText>
                    <CFormInput
                      placeholder="CPF"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      required
                    />
                    <CFormFeedback invalid>Por favor, informe seu CPF.</CFormFeedback>
                  </CInputGroup>

                  <CRow>
                    <CCol xs={8}>
                      <CInputGroup className="mb-3">
                        <CInputGroupText><CIcon icon={cilBriefcase} /></CInputGroupText>
                        <CFormInput
                          placeholder="CRM"
                          name="crm"
                          value={formData.crm}
                          onChange={handleInputChange}
                          required
                        />
                        <CFormFeedback invalid>Por favor, informe seu CRM.</CFormFeedback>
                      </CInputGroup>
                    </CCol>
                    <CCol xs={4}>
                      <CInputGroup className="mb-3">
                        <CFormSelect
                          name="crm_uf"
                          value={formData.crm_uf}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">UF</option>
                          {estados.map((uf) => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </CFormSelect>
                        <CFormFeedback invalid>Selecione a UF do CRM.</CFormFeedback>
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Senha"
                      autoComplete="new-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <CFormFeedback invalid>Por favor, crie uma senha.</CFormFeedback>
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repita a senha"
                      autoComplete="new-password"
                      name="repeatPassword"
                      value={formData.repeatPassword}
                      onChange={handleInputChange}
                      required
                    />
                    {validated && formData.password !== formData.repeatPassword && (
                      <CFormFeedback invalid>As senhas não coincidem.</CFormFeedback>
                    )}
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton color="success" type="submit">
                      Criar conta
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register