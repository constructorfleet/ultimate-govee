import { registerAs } from '@nestjs/config';
import { BleModuleOptionsKey } from './ble.types';

export type BleModuleOptions = {
  enabled: boolean;
};

export const BleConfig = registerAs(BleModuleOptionsKey, () => ({
  enabled: false,
}));
