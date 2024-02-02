import { FactoryProvider } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { Optional } from '@govee/common';
import { Md5 } from 'ts-md5';
import { v4 as uuidv4 } from 'uuid';

const AccountConfigKey = 'Configuration.Account';

export type AccountConfig = {
  username: string;
  password: string;
  clientId: string;
  apiKey: string;
  saveAuthInfo?: Optional<string>;
};

export const CredentialsConfig = registerAs('GoveeCredentials', () => ({
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  apiKey: process.env.API_KEY,
  saveAuthInfo: process.env.SAVE_AUTH,
}));

export const AccountConfig: FactoryProvider = {
  provide: AccountConfigKey,
  inject: [CredentialsConfig.KEY],
  useFactory: (
    credentials: ConfigType<typeof CredentialsConfig>,
  ): AccountConfig => ({
    username: credentials.username || process.env.USERNAME || '',
    password: credentials.password || process.env.PASSWORD || '',
    clientId:
      process.env.CLIENT_ID ||
      Md5.hashStr(
        Buffer.from(
          uuidv4() + new Date().getMilliseconds().toString(),
        ).toString('utf8'),
        false,
      ),
    saveAuthInfo: credentials.saveAuthInfo,
    apiKey: credentials.apiKey || process.env.API_KEY || '',
  }),
};
