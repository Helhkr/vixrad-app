import React from 'react';
import { Menu, Button, Tooltip } from 'antd'; // Added Button, Tooltip
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'; // Imported icons
import type { Section } from '../../types/template';

interface ReportSidebarProps {
  sections: Section[];
  onSelectSubsection: (subsectionId: string) => void;
  selectedSubsectionId: string;
  activeSubsections: Record<string, boolean>; // New prop
  onToggleSubsectionActive: (subsectionId: string) => void; // New prop
}

export const ReportSidebar: React.FC<ReportSidebarProps> = ({
  sections,
  onSelectSubsection,
  selectedSubsectionId,
  activeSubsections, // Destructure new prop
  onToggleSubsectionActive, // Destructure new prop
}) => {
  const defaultOpenKeys = sections.map(section => section.id);

  const menuItems = sections.map(section => ({
    key: section.id,
    label: section.name,
    children: section.subsections.map(subsection => ({
      key: subsection.id,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{subsection.name}</span>
          <Tooltip title={activeSubsections[subsection.id] ? 'Desativar Subseção' : 'Ativar Subseção'}>
            <Button
              type="text"
              icon={activeSubsections[subsection.id] ? <UnlockOutlined /> : <LockOutlined />}
              onClick={(e) => {
                e.stopPropagation(); // Prevent menu item selection when clicking the button
                onToggleSubsectionActive(subsection.id);
              }}
              style={{ color: activeSubsections[subsection.id] ? 'green' : 'red' }}
            />
          </Tooltip>
        </div>
      ),
    })),
  }));

  return (
    <Menu
      mode="inline"
      defaultOpenKeys={defaultOpenKeys}
      selectedKeys={[selectedSubsectionId]}
      style={{ height: '100%', borderRight: 0 }}
      onSelect={({ key }) => onSelectSubsection(key as string)}
      items={menuItems}
    />
  );
};