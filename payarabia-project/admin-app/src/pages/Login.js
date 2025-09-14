import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Label,
  MessageStrip,
} from '@ui5/webcomponents-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
      padding: '20px',
    }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ padding: '32px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1976D2',
              marginBottom: '8px',
            }}>
              PAYARABIA
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              لوحة إدارة منصة الدفع الرقمي
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <MessageStrip
              design="Negative"
              style={{ marginBottom: '16px' }}
            >
              {error}
            </MessageStrip>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <Label required>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={email}
                onInput={(e) => setEmail(e.target.value)}
                placeholder="admin@payarabia.com"
                style={{ marginTop: '4px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Label required>كلمة المرور</Label>
              <Input
                type="password"
                value={password}
                onInput={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ marginTop: '4px' }}
                required
              />
            </div>

            <Button
              type="submit"
              design="Emphasized"
              style={{ width: '100%', height: '44px' }}
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '12px',
            color: '#666',
          }}>
            © 2024 PAYARABIA. جميع الحقوق محفوظة.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;