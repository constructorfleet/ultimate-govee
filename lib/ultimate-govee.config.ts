import { FactoryProvider, Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from 'ultimate-govee.types';

export const UltimateGoveeConfig = 'Configuration.Ultimate-Govee';

export type UltimateGoveeConfig = {
  username?: string;
  password?: string;
  apikey?: string;
  refreshMargin?: number;
  connections?: {
    iot?: boolean;
    ble?: boolean;
    openApi?: boolean;
  };
  storageDirectory?: string;
};

export const InjectGoveeConfig = Inject(UltimateGoveeConfig);

export const UltimateGoveeConfiguration: FactoryProvider = {
  provide: UltimateGoveeConfig,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): UltimateGoveeConfig => ({
    username: process.env.USERNAME || '',
    password: process.env.PASSWORD || '',
    apikey: process.env.API_KEY || '',
    refreshMargin: options?.auth?.refreshMargin,
    connections: {
      iot: options?.channels?.iot?.enabled,
      ble: options?.channels?.ble?.enabled,
      openApi: false,
    },
    storageDirectory: options?.persist?.rootDirectory,
  }),
};
