import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilNotes,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Laudos',
    to: '/laudos',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Modelos de Laudos',
        to: '/laudos/templates',
      },
    ],
  },
]

export default _nav
