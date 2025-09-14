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
} from '@ui5/webcomponents-react';
import { apiService } from '../services/api';
import VoiceCallModal from '../components/Support/VoiceCallModal';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTickets(1, 50, filters);
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (ticket) => {
    setSelectedTicket(ticket);
    setShowCallModal(true);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await apiService.updateTicketStatus(ticketId, newStatus);
      loadTickets(); // Reload tickets
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'red';
      case 'in_progress': return 'blue';
      case 'resolved': return 'green';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'مفتوحة';
      case 'in_progress': return 'قيد المعالجة';
      case 'resolved': return 'تم الحل';
      default: return 'غير محدد';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return 'غير محدد';
    }
  };

  return (
    <div>
      <Title level="H1" style={{ marginBottom: '24px' }}>
        إدارة تذاكر الدعم
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
                placeholder="البحث في التذاكر..."
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
                <Option value="open">مفتوحة</Option>
                <Option value="in_progress">قيد المعالجة</Option>
                <Option value="resolved">تم الحل</Option>
              </Select>
            </div>
            <div>
              <Label>الأولوية</Label>
              <Select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.detail.selectedOption.value })}
              >
                <Option value="">جميع الأولويات</Option>
                <Option value="urgent">عاجل</Option>
                <Option value="high">عالي</Option>
                <Option value="medium">متوسط</Option>
                <Option value="low">منخفض</Option>
              </Select>
            </div>
            <Button
              design="Emphasized"
              onClick={loadTickets}
            >
              تطبيق الفلاتر
            </Button>
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card>
        <div style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              جاري تحميل التذاكر...
            </div>
          ) : tickets.length === 0 ? (
            <MessageStrip design="Information">
              لا توجد تذاكر مطابقة للفلاتر المحددة
            </MessageStrip>
          ) : (
            <Table
              columns={
                <>
                  <TableColumn>رقم التذكرة</TableColumn>
                  <TableColumn>المستخدم</TableColumn>
                  <TableColumn>الموضوع</TableColumn>
                  <TableColumn>الحالة</TableColumn>
                  <TableColumn>الأولوية</TableColumn>
                  <TableColumn>التاريخ</TableColumn>
                  <TableColumn>الإجراءات</TableColumn>
                </>
              }
            >
              {tickets.map(ticket => (
                <TableRow key={ticket._id}>
                  <TableColumn>{ticket.ticketNumber}</TableColumn>
                  <TableColumn>{ticket.user?.fullName || 'غير محدد'}</TableColumn>
                  <TableColumn>{ticket.subject}</TableColumn>
                  <TableColumn>
                    <Label color={getStatusColor(ticket.status)}>
                      {getStatusText(ticket.status)}
                    </Label>
                  </TableColumn>
                  <TableColumn>
                    <Label color="blue">
                      {getPriorityText(ticket.priority)}
                    </Label>
                  </TableColumn>
                  <TableColumn>
                    {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                  </TableColumn>
                  <TableColumn>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        design="Emphasized"
                        icon="phone"
                        onClick={() => handleCall(ticket)}
                        size="S"
                      >
                        اتصال
                      </Button>
                      <Select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket._id, e.detail.selectedOption.value)}
                        size="S"
                      >
                        <Option value="open">مفتوحة</Option>
                        <Option value="in_progress">قيد المعالجة</Option>
                        <Option value="resolved">تم الحل</Option>
                      </Select>
                    </div>
                  </TableColumn>
                </TableRow>
              ))}
            </Table>
          )}
        </div>
      </Card>

      {/* Voice Call Modal */}
      {showCallModal && (
        <VoiceCallModal
          ticket={selectedTicket}
          onClose={() => setShowCallModal(false)}
        />
      )}
    </div>
  );
};

export default Support;