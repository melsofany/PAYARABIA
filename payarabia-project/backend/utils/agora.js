const RtcTokenBuilder = require('agora-access-token').RtcTokenBuilder;
const RtcRole = require('agora-access-token').RtcRole;

const generateAgoraToken = (options) => {
  const {
    channelName,
    uid,
    role = 'publisher',
    expirationTimeInSeconds = 3600,
  } = options;

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new Error('Agora App ID and Certificate are required');
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    rtcRole,
    privilegeExpiredTs
  );

  return token;
};

const generateChannelName = (ticketId) => {
  return `ticket_${ticketId}_${Date.now()}`;
};

module.exports = {
  generateAgoraToken,
  generateChannelName,
};