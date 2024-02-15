import { FactoryProvider, Inject } from '@nestjs/common';

export const GoveeConfig = 'Configuration.Govee';

export type GoveeConfig = {
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

export const InjectGoveeConfig = Inject(GoveeConfig);

export const GoveeConfiguration: FactoryProvider = {
  provide: GoveeConfig,
  useFactory: (): GoveeConfig => ({
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
