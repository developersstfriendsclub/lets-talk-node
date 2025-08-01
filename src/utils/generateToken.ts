import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export const generateAgoraToken = (
  channelName: string,
  uid: number = 0,
  role: number = RtcRole.PUBLISHER
): string => {
  const appID = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
  const expirationTimeInSeconds = parseInt(process.env.TOKEN_EXPIRE_TIME || '3600');
  if (!appID || !appCertificate) {
    throw new Error('AGORA_APP_ID or AGORA_APP_CERTIFICATE is missing in environment variables.');
  }
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );
};