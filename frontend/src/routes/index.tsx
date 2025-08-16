import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ReportEditorPage from '../pages/ReportEditorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <div>Dashboard (Public)</div> },
      {
        path: 'app/laudos/criar',
        element: <ReportEditorPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);

export default router;
