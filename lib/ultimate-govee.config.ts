import { FactoryProvider, Inject } from '@nestjs/common';

export const UltimateGoveeConfig = 'Configuration.Ultimate-Govee';

export type UltimateGoveeConfig = {
  username: string;
  password: string;
  apikey: string;
  connections: {
    iot: boolean;
    ble: boolean;
    openApi: boolean;
  };
  storageDirectory: string;
};

export const InjectGoveeConfig = Inject(UltimateGoveeConfig);

export const UltimateGoveeConfiguration: FactoryProvider = {
  provide: UltimateGoveeConfig,
  useFactory: (): UltimateGoveeConfig => ({
    username: process.env.USERNAME || '',
    password: process.env.PASSWORD || '',
    apikey: process.env.API_KEY || '',
    connections: {
      iot: process.env.ENABLE_IOT === 'true',
      ble: process.env.ENABLE_BLE === 'true',
      openApi: process.env.ENABLE_OPENAPI === 'true',
    },
    storageDirectory: process.env.STORAGE_DIR || 'peristed',
  }),
};
