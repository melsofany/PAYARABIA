import React, { useState, useEffect } from 'react';
import {
  Title,
  Card,
  Table,
  TableColumn,
  TableRow,
  Button,
  Label,
  Input,
  Select,
  Option,
  MessageStrip,
  Avatar,
} from '@ui5/webcomponents-react';
import { apiService } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    verification: '',
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers(1, 50, filters);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, reason) => {
    try {
      await apiService.blockUser(userId, reason);
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await apiService.unblockUser(userId);
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'blocked': return 'red';
      case 'pending': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'blocked': return 'محظور';
      case 'pending': return 'معلق';
      default: return 'غير محدد';
    }
  };

  const getVerificationText = (isVerified) => {
    return isVerified ? 'موثق' : 'غير موثق';
  };

  const getVerificationColor = (isVerified) => {
    return isVerified ? 'green' : 'orange';
  };

  return (
    <div>
      <Title level="H1" style={{ marginBottom: '24px' }}>
        إدارة المستخدمين
      </Title>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'end',
          }}>
            <div>
              <Label>البحث</Label>
              <Input
                placeholder="البحث في المستخدمين..."
                value={filters.search}
                onInput={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label>الحالة</Label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.detail.selectedOption.value })}
              >
                <Option value="">جميع الحالات</Option>
                <Option value="active">نشط</Option>
                <Option value="blocked">محظور</Option>
                <Option value="pending">معلق</Option>
              </Select>
            </div>
            <div>
              <Label>التوثيق</Label>
              <Select
                value={filters.verification}
                onChange={(e) => setFilters({ ...filters, verification: e.detail.selectedOption.value })}
              >
                <Option value="">جميع المستخدمين</Option>
                <Option value="verified">موثق</Option>
                <Option value="unverified">غير موثق</Option>
              </Select>
            </div>
            <Button
              design="Emphasized"
              onClick={loadUsers}
            >
              تطبيق الفلاتر
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              جاري تحميل المستخدمين...
            </div>
          ) : users.length === 0 ? (
            <MessageStrip design="Information">
              لا توجد مستخدمين مطابقين للفلاتر المحددة
            </MessageStrip>
          ) : (
            <Table
              columns={
                <>
                  <TableColumn>المستخدم</TableColumn>
                  <TableColumn>البريد الإلكتروني</TableColumn>
                  <TableColumn>رقم الهاتف</TableColumn>
                  <TableColumn>الحالة</TableColumn>
                  <TableColumn>التوثيق</TableColumn>
                  <TableColumn>تاريخ التسجيل</TableColumn>
                  <TableColumn>الإجراءات</TableColumn>
                </>
              }
            >
              {users.map(user => (
                <TableRow key={user._id}>
                  <TableColumn>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar
                        size="S"
                        initials={user.fullName?.charAt(0) || 'U'}
                      />
                      <span>{user.fullName}</span>
                    </div>
                  </TableColumn>
                  <TableColumn>{user.email}</TableColumn>
                  <TableColumn>{user.phone}</TableColumn>
                  <TableColumn>
                    <Label color={getStatusColor(user.status)}>
                      {getStatusText(user.status)}
                    </Label>
                  </TableColumn>
                  <TableColumn>
                    <Label color={getVerificationColor(user.isVerified)}>
                      {getVerificationText(user.isVerified)}
                    </Label>
                  </TableColumn>
                  <TableColumn>
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </TableColumn>
                  <TableColumn>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        design="Transparent"
                        size="S"
                        onClick={() => {
                          // View user details
                        }}
                      >
                        عرض
                      </Button>
                      {user.status === 'active' ? (
                        <Button
                          design="Negative"
                          size="S"
                          onClick={() => handleBlockUser(user._id, 'انتهاك الشروط')}
                        >
                          حظر
                        </Button>
                      ) : (
                        <Button
                          design="Positive"
                          size="S"
                          onClick={() => handleUnblockUser(user._id)}
                        >
                          إلغاء الحظر
                        </Button>
                      )}
                    </div>
                  </TableColumn>
                </TableRow>
              ))}
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Users;