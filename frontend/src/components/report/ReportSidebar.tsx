import React from 'react';
import { Menu } from 'antd';
import type { Section } from '../../types/template';

interface ReportSidebarProps {
  sections: Section[];
  onSelectSubsection: (subsectionId: string) => void;
  selectedSubsectionId: string;
}

export const ReportSidebar: React.FC<ReportSidebarProps> = ({
  sections,
  onSelectSubsection,
  selectedSubsectionId,
}) => {
  const defaultOpenKeys = sections.map(section => section.id);

  const menuItems = sections.map(section => ({
    key: section.id,
    label: section.name,
    children: section.subsections.map(subsection => ({
      key: subsection.id,
      label: subsection.name,
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