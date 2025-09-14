import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Icon,
} from '@ui5/webcomponents-react';
import { apiService } from '../services/api';
import Chart from '../components/Dashboard/Chart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card style={{ height: '120px' }}>
      <div style={{ padding: '20px' }}>
        <FlexBox
          direction={FlexBoxDirection.Row}
          justifyContent={FlexBoxJustifyContent.SpaceBetween}
          alignItems={FlexBoxAlignItems.Center}
        >
          <div>
            <Text style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              {title}
            </Text>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: color }}>
              {value}
            </Text>
            {subtitle && (
              <Text style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {subtitle}
              </Text>
            )}
          </div>
          <Icon name={icon} style={{ fontSize: '32px', color: color }} />
        </FlexBox>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>جاري تحميل البيانات...</Text>
      </div>
    );
  }

  return (
    <div>
      <Title level="H1" style={{ marginBottom: '24px' }}>
        لوحة التحكم
      </Title>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <StatCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers.toLocaleString()}
          icon="group"
          color="#1976D2"
          subtitle={`${stats.activeUsers} نشط`}
        />
        <StatCard
          title="إجمالي المعاملات"
          value={stats.totalTransactions.toLocaleString()}
          icon="money-bills"
          color="#4CAF50"
        />
        <StatCard
          title="حجم المعاملات"
          value={`${stats.totalVolume.toLocaleString()} ريال`}
          icon="trending-up"
          color="#FF9800"
        />
        <StatCard
          title="تذاكر الدعم"
          value={stats.pendingTickets}
          icon="support"
          color="#F44336"
          subtitle={`${stats.resolvedTickets} محلولة`}
        />
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <Title level="H3" style={{ marginBottom: '16px' }}>
              إحصائيات المعاملات
            </Title>
            <Chart type="transactions" />
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px' }}>
            <Title level="H3" style={{ marginBottom: '16px' }}>
              نمو المستخدمين
            </Title>
            <Chart type="users" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div style={{ padding: '20px' }}>
          <Title level="H3" style={{ marginBottom: '16px' }}>
            النشاط الأخير
          </Title>
          <div style={{ color: '#666' }}>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <Text>تم إنشاء حساب جديد - أحمد محمد</Text>
              <Text style={{ fontSize: '12px', color: '#999' }}>منذ 5 دقائق</Text>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <Text>تم حل تذكرة دعم #TK-2024-001</Text>
              <Text style={{ fontSize: '12px', color: '#999' }}>منذ 15 دقيقة</Text>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <Text>تحويل مبلغ 500 ريال - سارة أحمد</Text>
              <Text style={{ fontSize: '12px', color: '#999' }}>منذ 30 دقيقة</Text>
            </div>
            <div style={{ padding: '8px 0' }}>
              <Text>تسجيل دخول جديد - محمد علي</Text>
              <Text style={{ fontSize: '12px', color: '#999' }}>منذ ساعة</Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;