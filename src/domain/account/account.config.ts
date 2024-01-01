import { FactoryProvider } from '@nestjs/common';

const AccountConfigKey = 'Configuration.Account';

export type AccountConfig = {
  username: string;
  password: string;
  clientId: string;
  apiKey: string;
};

export const AccountConfig: FactoryProvider = {
  provide: AccountConfigKey,
  useFactory: (): AccountConfig => ({
    username: '',
    password: '',
    clientId: '',
    apiKey: '',
  }),
};
