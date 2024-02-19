import { FactoryProvider, Inject } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './iot-channel.types';

export const IoTChannelConfigEnabledKey = 'Config.IoTChannel.Enabled';
export const InjectEnabled = Inject(IoTChannelConfigEnabledKey);
export const IoTChannelConfigEnabledProfovider: FactoryProvider = {
  provide: IoTChannelConfigEnabledKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): boolean =>
    options.enabled ?? false,
};
