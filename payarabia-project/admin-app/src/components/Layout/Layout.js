import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ShellBar,
  ShellBarItem,
  Avatar,
  Popover,
  List,
  StandardListItem,
  Button,
} from '@ui5/webcomponents-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setProfilePopoverOpen(false);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return 'لوحة التحكم';
      case '/users':
        return 'إدارة المستخدمين';
      case '/support':
        return 'الدعم الفني';
      case '/finance':
        return 'الإدارة المالية';
      case '/settings':
        return 'الإعدادات';
      default:
        return 'PAYARABIA';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <ShellBar
          primaryTitle={getPageTitle()}
          secondaryTitle="منصة الدفع الرقمي"
          logo={<img src="/logo192.png" alt="PAYARABIA" />}
          showCoPilot={false}
          showNotifications={false}
          showProductSwitch={false}
          profile={
            <Avatar
              size="S"
              initials={user?.fullName?.charAt(0) || 'A'}
              onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
              style={{ cursor: 'pointer' }}
            />
          }
        />

        {/* Profile Popover */}
        <Popover
          open={profilePopoverOpen}
          onAfterClose={() => setProfilePopoverOpen(false)}
          opener="profile-avatar"
        >
          <div style={{ padding: '16px', minWidth: '200px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {user?.fullName}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {user?.email}
              </div>
            </div>
            <List>
              <StandardListItem
                icon="settings"
                text="الإعدادات"
                onClick={() => {
                  setProfilePopoverOpen(false);
                  // Navigate to settings
                }}
              />
              <StandardListItem
                icon="log"
                text="تسجيل الخروج"
                onClick={handleLogout}
              />
            </List>
          </div>
        </Popover>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;