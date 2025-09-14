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
  Text,
} from '@ui5/webcomponents-react';
import { apiService } from '../services/api';

const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [commissionSettings, setCommissionSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'transactions':
          const transactionsData = await apiService.getTransactions(1, 50);
          setTransactions(transactionsData.transactions || []);
          break;
        case 'exchange-rates':
          const ratesData = await apiService.getExchangeRates();
          setExchangeRates(ratesData || []);
          break;
        case 'commission':
          const commissionData = await apiService.getCommissionSettings();
          setCommissionSettings(commissionData || {});
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'deposit': return 'إيداع';
      case 'withdrawal': return 'سحب';
      case 'transfer': return 'تحويل';
      case 'exchange': return 'تحويل عملة';
      default: return 'غير محدد';
    }
  };

  const getTransactionStatusText = (status) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'completed': return 'مكتمل';
      case 'failed': return 'فشل';
      default: return 'غير محدد';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div>
      <Title level="H1" style={{ marginBottom: '24px' }}>
        الإدارة المالية
      </Title>

      {/* Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            design={activeTab === 'transactions' ? 'Emphasized' : 'Transparent'}
            onClick={() => setActiveTab('transactions')}
          >
            المعاملات
          </Button>
          <Button
            design={activeTab === 'exchange-rates' ? 'Emphasized' : 'Transparent'}
            onClick={() => setActiveTab('exchange-rates')}
          >
            أسعار الصرف
          </Button>
          <Button
            design={activeTab === 'commission' ? 'Emphasized' : 'Transparent'}
            onClick={() => setActiveTab('commission')}
          >
            إعدادات العمولة
          </Button>
        </div>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level="H3">المعاملات المالية</Title>
              <Button design="Emphasized">
                تصدير التقرير
              </Button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                جاري تحميل المعاملات...
              </div>
            ) : transactions.length === 0 ? (
              <MessageStrip design="Information">
                لا توجد معاملات
              </MessageStrip>
            ) : (
              <Table
                columns={
                  <>
                    <TableColumn>رقم المعاملة</TableColumn>
                    <TableColumn>النوع</TableColumn>
                    <TableColumn>المستخدم</TableColumn>
                    <TableColumn>المبلغ</TableColumn>
                    <TableColumn>الحالة</TableColumn>
                    <TableColumn>التاريخ</TableColumn>
                    <TableColumn>الإجراءات</TableColumn>
                  </>
                }
              >
                {transactions.map(transaction => (
                  <TableRow key={transaction._id}>
                    <TableColumn>{transaction.transactionNumber}</TableColumn>
                    <TableColumn>{getTransactionTypeText(transaction.type)}</TableColumn>
                    <TableColumn>{transaction.user?.fullName || 'غير محدد'}</TableColumn>
                    <TableColumn>
                      {transaction.amount} {transaction.currency}
                    </TableColumn>
                    <TableColumn>
                      <Label color={getStatusColor(transaction.status)}>
                        {getTransactionStatusText(transaction.status)}
                      </Label>
                    </TableColumn>
                    <TableColumn>
                      {new Date(transaction.createdAt).toLocaleDateString('ar-SA')}
                    </TableColumn>
                    <TableColumn>
                      <Button design="Transparent" size="S">
                        عرض التفاصيل
                      </Button>
                    </TableColumn>
                  </TableRow>
                ))}
              </Table>
            )}
          </div>
        </Card>
      )}

      {/* Exchange Rates Tab */}
      {activeTab === 'exchange-rates' && (
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level="H3">أسعار الصرف</Title>
              <Button design="Emphasized">
                تحديث الأسعار
              </Button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                جاري تحميل أسعار الصرف...
              </div>
            ) : (
              <Table
                columns={
                  <>
                    <TableColumn>من</TableColumn>
                    <TableColumn>إلى</TableColumn>
                    <TableColumn>السعر</TableColumn>
                    <TableColumn>آخر تحديث</TableColumn>
                    <TableColumn>الإجراءات</TableColumn>
                  </>
                }
              >
                {exchangeRates.map((rate, index) => (
                  <TableRow key={index}>
                    <TableColumn>{rate.fromCurrency}</TableColumn>
                    <TableColumn>{rate.toCurrency}</TableColumn>
                    <TableColumn>{rate.rate}</TableColumn>
                    <TableColumn>
                      {new Date(rate.lastUpdated).toLocaleDateString('ar-SA')}
                    </TableColumn>
                    <TableColumn>
                      <Button design="Transparent" size="S">
                        تعديل
                      </Button>
                    </TableColumn>
                  </TableRow>
                ))}
              </Table>
            )}
          </div>
        </Card>
      )}

      {/* Commission Settings Tab */}
      {activeTab === 'commission' && (
        <Card>
          <div style={{ padding: '20px' }}>
            <Title level="H3" style={{ marginBottom: '16px' }}>
              إعدادات العمولة
            </Title>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                جاري تحميل الإعدادات...
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <Label>عمولة التحويل المحلي</Label>
                  <Input
                    value={commissionSettings.localTransfer || ''}
                    placeholder="0.00"
                    suffix="%"
                  />
                </div>
                <div>
                  <Label>عمولة التحويل الدولي</Label>
                  <Input
                    value={commissionSettings.internationalTransfer || ''}
                    placeholder="0.00"
                    suffix="%"
                  />
                </div>
                <div>
                  <Label>عمولة تحويل العملة</Label>
                  <Input
                    value={commissionSettings.currencyExchange || ''}
                    placeholder="0.00"
                    suffix="%"
                  />
                </div>
                <div>
                  <Label>الحد الأدنى للعمولة</Label>
                  <Input
                    value={commissionSettings.minimumCommission || ''}
                    placeholder="0.00"
                    suffix="ريال"
                  />
                </div>
                <Button design="Emphasized">
                  حفظ الإعدادات
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Finance;