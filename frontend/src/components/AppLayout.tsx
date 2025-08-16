import React from 'react';
import { Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  const menuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Utilizador',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'lightgray' }}>
      <div style={{ background: '#0d0d0d', padding: '0 20px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>VixRad</div>
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ background: '#0d0d0d', borderBottom: 'none' }}
          items={menuItems}
        />
      </div>
      <div
        style={{
          padding: 24,
          margin: 0,
          minHeight: 'calc(100vh - 64px)', // Ensure it takes full height below header
          height: '100%', // Explicitly take 100% height of parent
          flex: 1,
          overflow: 'auto',
          background: 'lightgray', // Temporary background for debugging
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;