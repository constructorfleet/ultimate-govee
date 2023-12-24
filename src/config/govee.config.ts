import { FactoryProvider, NotImplementedException } from '@nestjs/common';

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
