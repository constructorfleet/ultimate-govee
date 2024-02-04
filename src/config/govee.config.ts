import { FactoryProvider, NotImplementedException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export const GoveeConfig = 'Configuration.Govee';

export type GoveeConfig = {
  username: string;
  password: string;
  clientId: string;
  enable: {
    iot: boolean;
    ble: boolean;
  };
  storageDirectory: string;
};

export const GoveeConfiguration: FactoryProvider = {
  provide: GoveeConfig,
  useFactory: (): GoveeConfig => {
    throw new NotImplementedException();
  },
};

export const CredentialsConfig = registerAs(
  'Configuration.Credentials',
  () => ({
    username: process.env.USERNAME || '',
    password: process.env.PASSWORD || '',
    apikey: process.env.API_KEY || '',
  }),
);
