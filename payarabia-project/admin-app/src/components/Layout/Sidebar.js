import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  SideNavigation,
  SideNavigationItem,
  SideNavigationSubItem,
  Icon,
} from '@ui5/webcomponents-react';

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      text: 'لوحة التحكم',
      icon: 'home',
      path: '/',
    },
    {
      id: 'users',
      text: 'المستخدمين',
      icon: 'group',
      path: '/users',
    },
    {
      id: 'support',
      text: 'الدعم الفني',
      icon: 'support',
      path: '/support',
    },
    {
      id: 'finance',
      text: 'الإدارة المالية',
      icon: 'money-bills',
      path: '/finance',
    },
    {
      id: 'settings',
      text: 'الإعدادات',
      icon: 'settings',
      path: '/settings',
    },
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div style={{ width: collapsed ? '60px' : '250px', transition: 'width 0.3s' }}>
      <SideNavigation
        collapsed={collapsed}
        onSelectionChange={(event) => {
          const selectedItem = event.detail.selectedItems[0];
          if (selectedItem) {
            const item = menuItems.find(item => item.id === selectedItem.id);
            if (item) {
              handleItemClick(item.path);
            }
          }
        }}
      >
        {menuItems.map((item) => (
          <SideNavigationItem
            key={item.id}
            id={item.id}
            text={item.text}
            icon={item.icon}
            selected={location.pathname === item.path}
          />
        ))}
      </SideNavigation>
    </div>
  );
};

export default Sidebar;