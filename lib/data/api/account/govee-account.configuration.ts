import { registerAs } from '@nestjs/config';
import { goveeAuthenticatedHeaders, goveeHeaders } from '../../utils';

const authUrl = 'https://app2.govee.com/account/rest/account/v1/login';
const communityAuthUrl = 'https://community-api.govee.com/os/v1/login';
const refreshTokenUrl =
  'https://app2.govee.com/account/rest/v1/first/refresh-tokens';
const iotCertUrl = 'https://app2.govee.com/app/v1/account/iot/key';
const GoveeAccountConfigKey = 'Configuration.Govee.Account';

export type GoveeCredentials = {
  username: string;
  password: string;
  clientId: string;
};

export const GoveeAccountConfig = registerAs(GoveeAccountConfigKey, () => ({
  authUrl,
  communityAuthUrl,
  iotCertUrl,
  refreshTokenUrl,
  saveAuthTo: process.env.SAVE_AUTH_FILE,
  headers: goveeHeaders,
  authenticatedHeaders: goveeAuthenticatedHeaders,
}));
