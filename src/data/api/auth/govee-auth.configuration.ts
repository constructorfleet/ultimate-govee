import { FactoryProvider } from '@nestjs/common';
import { GoveeAPIConfig } from '../govee-api.config';
import { registerAs } from '@nestjs/config';

const authUrl = 'https://app2.govee.com/account/rest/account/login';
const appVersion = '5.6.01';
const GoveeAuthConfigKey = 'Configuration.Govee.Auth';

export type GoveeCredentials = {
  username: string;
  password: string;
  clientId: string;
};
export type GoveeAuthConfig = {
  headers: (credentials: GoveeCredentials) => Record<string, string>;
  authUrl: string;
};

export const GoveeAuthConfiguration = registerAs(GoveeAuthConfigKey, () => ({
  authUrl,
  headers: (credentials: GoveeCredentials) => ({
    clientType: `1`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    iotVersion: '0',
    clientId: credentials.clientId,
    'User-Agent': `GoveeHome/${appVersion} (com.ihoment.GoVeeSensor; build:2; iOS 16.5.0) Alamofire/5.6.4`,
    appVersion: appVersion,
  }),
}));
