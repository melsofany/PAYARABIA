import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  Title,
  Text,
  Icon,
  MessageStrip,
} from '@ui5/webcomponents-react';
import { apiService } from '../../services/api';

const VoiceCallModal = ({ ticket, onClose }) => {
  const [callStatus, setCallStatus] = useState('initiating');
  const [callData, setCallData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    initiateCall();
  }, []);

  const initiateCall = async () => {
    try {
      setCallStatus('initiating');
      const data = await apiService.initiateVoiceCall(ticket._id);
      setCallData(data);
      setCallStatus('connected');
    } catch (error) {
      setError('فشل في إجراء المكالمة');
      setCallStatus('failed');
    }
  };

  const endCall = async () => {
    try {
      if (callData?.callId) {
        await apiService.endVoiceCall(callData.callId);
      }
      onClose();
    } catch (error) {
      console.error('Error ending call:', error);
      onClose();
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'initiating':
        return 'جاري الاتصال...';
      case 'connected':
        return 'متصل';
      case 'failed':
        return 'فشل في الاتصال';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'initiating':
        return 'blue';
      case 'connected':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Dialog
      open={true}
      onAfterClose={onClose}
      headerText={`مكالمة صوتية - ${ticket.ticketNumber}`}
      style={{ width: '400px' }}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        {/* User Avatar */}
        <div style={{ marginBottom: '20px' }}>
          <Icon
            name="person-placeholder"
            style={{ fontSize: '64px', color: '#1976D2' }}
          />
        </div>

        {/* User Info */}
        <Title level="H3" style={{ marginBottom: '8px' }}>
          {ticket.user?.fullName || 'المستخدم'}
        </Title>
        <Text style={{ color: '#666', marginBottom: '16px' }}>
          {ticket.subject}
        </Text>

        {/* Call Status */}
        <div style={{ marginBottom: '20px' }}>
          <Label color={getStatusColor()}>
            {getStatusText()}
          </Label>
        </div>

        {/* Error Message */}
        {error && (
          <MessageStrip design="Negative" style={{ marginBottom: '20px' }}>
            {error}
          </MessageStrip>
        )}

        {/* Call Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          {callStatus === 'connected' && (
            <>
              <Button
                design="Emphasized"
                icon="microphone"
                onClick={() => {
                  // Toggle microphone
                }}
              >
                كتم
              </Button>
              <Button
                design="Emphasized"
                icon="speaker"
                onClick={() => {
                  // Toggle speaker
                }}
              >
                مكبر صوت
              </Button>
            </>
          )}
          
          <Button
            design="Negative"
            icon="call-end"
            onClick={endCall}
          >
            إنهاء المكالمة
          </Button>
        </div>

        {/* Call Info */}
        {callData && (
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            <Text>معرف المكالمة: {callData.callId}</Text>
            <br />
            <Text>القناة: {callData.channelName}</Text>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default VoiceCallModal;