import React, { useState, useEffect } from 'react';
import {
  Title,
  Card,
  Input,
  Label,
  Button,
  Select,
  Option,
  MessageStrip,
  Text,
  Switch,
} from '@ui5/webcomponents-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';

const Settings = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await authService.updateProfile(profileData);
      showMessage('تم تحديث الملف الشخصي بنجاح', 'success');
    } catch (error) {
      showMessage('فشل في تحديث الملف الشخصي', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('كلمة المرور الجديدة غير متطابقة', 'error');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      showMessage('تم تغيير كلمة المرور بنجاح', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showMessage('فشل في تغيير كلمة المرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingsUpdate = async () => {
    try {
      setLoading(true);
      // API call to update system settings
      showMessage('تم تحديث إعدادات النظام بنجاح', 'success');
    } catch (error) {
      showMessage('فشل في تحديث إعدادات النظام', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level="H1" style={{ marginBottom: '24px' }}>
        الإعدادات
      </Title>

      {/* Message */}
      {message && (
        <MessageStrip
          design={messageType === 'success' ? 'Positive' : 'Negative'}
          style={{ marginBottom: '24px' }}
        >
          {message}
        </MessageStrip>
      )}

      {/* Profile Settings */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <Title level="H3" style={{ marginBottom: '16px' }}>
            الملف الشخصي
          </Title>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <Label required>الاسم الكامل</Label>
              <Input
                value={profileData.fullName}
                onInput={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                placeholder="الاسم الكامل"
              />
            </div>
            
            <div>
              <Label required>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={profileData.email}
                onInput={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="admin@payarabia.com"
              />
            </div>
            
            <div>
              <Label required>رقم الهاتف</Label>
              <Input
                value={profileData.phone}
                onInput={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+966501234567"
              />
            </div>
            
            <Button
              design="Emphasized"
              onClick={handleProfileUpdate}
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Password Settings */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <Title level="H3" style={{ marginBottom: '16px' }}>
            تغيير كلمة المرور
          </Title>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <Label required>كلمة المرور الحالية</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onInput={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <Label required>كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onInput={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <Label required>تأكيد كلمة المرور الجديدة</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onInput={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            
            <Button
              design="Emphasized"
              onClick={handlePasswordChange}
              disabled={loading}
            >
              {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </Button>
          </div>
        </div>
      </Card>

      {/* System Settings */}
      <Card>
        <div style={{ padding: '20px' }}>
          <Title level="H3" style={{ marginBottom: '16px' }}>
            إعدادات النظام
          </Title>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text>وضع الصيانة</Text>
                <br />
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  إيقاف النظام مؤقتاً للصيانة
                </Text>
              </div>
              <Switch
                checked={systemSettings.maintenanceMode}
                onChange={(e) => setSystemSettings({ 
                  ...systemSettings, 
                  maintenanceMode: e.target.checked 
                })}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text>تفعيل التسجيل</Text>
                <br />
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  السماح للمستخدمين الجدد بالتسجيل
                </Text>
              </div>
              <Switch
                checked={systemSettings.registrationEnabled}
                onChange={(e) => setSystemSettings({ 
                  ...systemSettings, 
                  registrationEnabled: e.target.checked 
                })}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text>الإشعارات بالبريد الإلكتروني</Text>
                <br />
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  إرسال إشعارات للمستخدمين عبر البريد الإلكتروني
                </Text>
              </div>
              <Switch
                checked={systemSettings.emailNotifications}
                onChange={(e) => setSystemSettings({ 
                  ...systemSettings, 
                  emailNotifications: e.target.checked 
                })}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text>الإشعارات بالرسائل النصية</Text>
                <br />
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  إرسال إشعارات للمستخدمين عبر الرسائل النصية
                </Text>
              </div>
              <Switch
                checked={systemSettings.smsNotifications}
                onChange={(e) => setSystemSettings({ 
                  ...systemSettings, 
                  smsNotifications: e.target.checked 
                })}
              />
            </div>
            
            <Button
              design="Emphasized"
              onClick={handleSystemSettingsUpdate}
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ إعدادات النظام'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;