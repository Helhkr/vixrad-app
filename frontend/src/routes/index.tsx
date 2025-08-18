import { createBrowserRouter } from 'react-router-dom';
import ReportEditorPage from '../pages/ReportEditorPage';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from './AuthLayout';
import AdminRoute from './AdminRoute';
import TemplateListPage from '../pages/admin/TemplateListPage';
import TemplateEditorAdminPage from '../pages/admin/TemplateEditorAdminPage';
import AuthPage from '../pages/AuthPage';
import HomeRedirect from './HomeRedirect';
import RootLayout from '../layouts/RootLayout';
import TemplateSelectionPage from '../pages/TemplateSelectionPage'; // Import the new page

const router = createBrowserRouter([
  {
    element: <RootLayout />, // RootLayout provides AuthProvider context for all its children
    children: [
      {
        path: '/',
        element: <HomeRedirect />, // Handles redirection based on auth state
      },
      {
        path: 'app',
        element: <ProtectedRoute />, // Protects /app and its children
        children: [
          { index: true, element: <TemplateSelectionPage /> }, // Set TemplateSelectionPage as the default for /app
          {
            path: 'laudos/criar/:id', // Add :id parameter to the route
            element: <ReportEditorPage />,
          },
        ],
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            path: 'templates',
            element: <TemplateListPage />,
          },
          {
            path: 'templates/novo',
            element: <TemplateEditorAdminPage />,
          },
          {
            path: 'templates/editar/:id',
            element: <TemplateEditorAdminPage />,
          },
        ],
      },
    ],
  },
  // Auth routes are separate and do not need to be children of RootLayout
  // as AuthPage itself will use useAuth, which is provided by RootLayout
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <AuthPage />,
      },
      {
        path: 'register',
        element: <AuthPage />,
      },
    ],
  },
]);

export default router;
