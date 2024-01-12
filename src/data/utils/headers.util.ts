import { OAuthData } from '../api/account/models/account-client';

const appVersion = '5.6.01';

export const goveeHeaders = (data: {
  clientId: string;
}): Record<string, string> => ({
  clientType: `1`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
  iotVersion: '0',
  clientId: data.clientId,
  'User-Agent': `GoveeHome/${appVersion} (com.ihoment.GoVeeSensor; build:2; iOS 16.5.0) Alamofire/5.6.4`,
  appVersion,
  AppVersion: appVersion,
});

export const goveeAuthenticatedHeaders = (
  data: OAuthData,
): Record<string, string> => ({
  ...goveeHeaders(data),
  Authorization: `Bearer ${data.accessToken}`,
});

export const goveeAPIKeyHeaders = (apiKey: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'Govee-API-Key': apiKey,
});
