import { FactoryProvider } from '@nestjs/common';
import { GoveeAPIConfig } from '../govee-api.config';

const deviceEffectUrl = '/appsku/v2/devices/scenes/attributes';

export const GoveeEffectConfig = 'Configuration.Govee.Effect';
export type GoveeEffectConfig = {
  deviceEffectUrl: string;
  storageDirectory: string;
};

export const GoveeEffectConfiguration: FactoryProvider = {
  provide: GoveeEffectConfig,
  inject: [GoveeAPIConfig],
  useFactory: (apiConfig: GoveeAPIConfig): GoveeEffectConfig => ({
    deviceEffectUrl: `${apiConfig.baseAppUrl}${deviceEffectUrl}`,
    storageDirectory: apiConfig.storageDirectory,
  }),
};
