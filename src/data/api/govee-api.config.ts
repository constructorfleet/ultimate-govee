import { FactoryProvider } from '@nestjs/common';
import { GoveeConfig } from 'src/govee.config';

export const GoveeAPIConfig = 'Configuration.Govee.API';
export type GoveeAPIConfig = {
  username: string;
  password: string;
  clientId: string;
  storageDirectory: string;
  baseAppUrl: string;
};

export const GoveeAPIConfiguration: FactoryProvider = {
  provide: GoveeAPIConfig,
  inject: [GoveeConfig],
  useFactory: (goveeConfig: GoveeConfig): GoveeAPIConfig => ({}),
};
