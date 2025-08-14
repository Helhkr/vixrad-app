import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const TemplateList = React.lazy(() => import('./views/laudos/TemplateList'))
const TemplateEditor = React.lazy(() => import('./views/laudos/TemplateEditor'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/laudos', name: 'Laudos', exact: true },
  { path: '/laudos/templates', name: 'Modelos de Laudos', element: TemplateList },
  { path: '/laudos/editor/:reportId', name: 'Editor de Laudo', element: TemplateEditor },
]

export default routes
