import { FactoryProvider, Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './ble-channel.types';

export const BleChannelConfigEnabledKey = 'Config.BleChannel.Enabled';
export const InjectEnabled = Inject(BleChannelConfigEnabledKey);
export const BleChannelConfigEnabledProfovider: FactoryProvider = {
  provide: BleChannelConfigEnabledKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): boolean =>
    options.enabled ?? false,
};

export const BleChannelConfigDeviceIdsKey = 'Config.BleChannel.DeviceIds';
export const InjectDeviceIds = Inject(BleChannelConfigDeviceIdsKey);
export const BleChannelConfigDeviceIdsProfovider: FactoryProvider = {
  provide: BleChannelConfigDeviceIdsKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): string[] =>
    options.deviceIds ?? [],
};
