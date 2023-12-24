import { FactoryProvider } from '@nestjs/common';
import { GoveeAPIConfig } from '../govee-api.config';

const skuListUrl = '/bi/rest/devices/v3/skus';

export const GoveeProductConfig = 'Configuration.Govee.Product';
export type GoveeProductConfig = {
  skuListUrl: string;
  storageDirectory: string;
};

export const GoveeProductConfiguration: FactoryProvider = {
  provide: GoveeProductConfig,
  inject: [GoveeAPIConfig],
  useFactory: (apiConfig: GoveeAPIConfig): GoveeProductConfig => ({
    skuListUrl: `${apiConfig.baseAppUrl}${skuListUrl}`,
    storageDirectory: apiConfig.storageDirectory,
  }),
};
