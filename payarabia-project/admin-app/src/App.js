import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@ui5/webcomponents-react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Support from './pages/Support';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import '@ui5/webcomponents/dist/Assets.js';
import '@ui5/webcomponents-fiori/dist/Assets.js';
import '@ui5/webcomponents-react/dist/Assets.js';

function ProtectedApp() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/support" element={<Support />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ProtectedApp />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;