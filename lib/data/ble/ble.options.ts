import { registerAs } from '@nestjs/config';

export type BleModuleOptions = {
  enabled: boolean;
};

export const BleConfig = registerAs('Configuration.Ble.Client', () => ({
  enabled: true,
}));
