import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom' 
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

// --- 1. NOSSAS IMPORTAÇÕES ---
// Importe o AuthProvider e o componente de Rota Protegida.
// (Ajuste o caminho se você criou os arquivos em pastas diferentes)
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const VerifyEmail = React.lazy(() => import('./views/pages/verify-email/VerifyEmail'))
const PleaseVerify = React.lazy(() => import('./views/pages/please-verify/PleaseVerify'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      {/* --- 2. ENVOLVER COM O AUTHPROVIDER --- */}
      {/* O AuthProvider agora abraça toda a aplicação, fornecendo o contexto de autenticação */}
      <AuthProvider>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          {/* --- 3. AJUSTAR AS ROTAS --- */}
          <Routes>
            {/* Estas são suas rotas PÚBLICAS. Qualquer um pode acessá-las. */}
            <Route exact path="/login" name="Login Page" element={<Login />} />
            <Route exact path="/register" name="Register Page" element={<Register />} />
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
            <Route exact path="/verify-email" name="Verify Email Page" element={<VerifyEmail />} />
            <Route exact path="/please-verify" name="Please Verify Page" element={<PleaseVerify />} />

      

            {/* Esta é a sua rota PROTEGIDA. */}
            {/* O React Router vai primeiro para o <ProtectedRoute />. */}
            {/* Se o usuário estiver logado, o ProtectedRoute renderiza o <DefaultLayout />. */}
            {/* Se não, ele redireciona para "/login". */}
            <Route path="*" name="Home" element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App