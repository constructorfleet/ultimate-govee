import { FactoryProvider, Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './ble-channel.const';
import { Optional } from '~ultimate-govee-common';

export const BleChannelConfigEnabledKey = 'Config.BleChannel.Enabled';
export const InjectEnabled = Inject(BleChannelConfigEnabledKey);
export const BleChannelConfigEnabledProvider: FactoryProvider = {
  provide: BleChannelConfigEnabledKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): Optional<boolean> =>
    options.enabled,
};

export const BleChannelConfigDeviceIdsKey = 'Config.BleChannel.DeviceIds';
export const InjectDeviceIds = Inject(BleChannelConfigDeviceIdsKey);
export const BleChannelConfigDeviceIdsProvider: FactoryProvider = {
  provide: BleChannelConfigDeviceIdsKey,
  inject: [{ token: MODULE_OPTIONS_TOKEN, optional: true }],
  useFactory: (options: Optional<typeof OPTIONS_TYPE>): Optional<string[]> =>
    options?.deviceIds,
};
