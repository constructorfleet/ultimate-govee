/* eslint-disable @typescript-eslint/ban-types */
import { FactoryProvider, Inject, Provider } from '@nestjs/common';
import { ChannelService } from './channel.service';
import {
  ChannelToggle,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  TogglableChannels,
} from './channel.types';
import { RestChannelService } from './rest';
import { BleChannelService } from './ble/ble-channel.service';
import { IoTChannelService } from './iot';

const TogglableChannelsKey = 'TogglableChannels';

export const InjectChannels = Inject(TogglableChannelsKey);

export const TogglableChannelsProvider: Provider = {
  provide: TogglableChannelsKey,
  useFactory: (
    ...channelServices: ChannelService<any, boolean>[]
  ): ChannelToggle => {
    const togglableChannelServices = channelServices
      .filter((provider) => provider.togglable === true)
      .map((provider) => provider as TogglableChannels);

    return togglableChannelServices.reduce(
      (acc, s) => ({
        ...acc,
        [s.name]: s,
      }),
      {} as Partial<ChannelToggle>,
    ) as Required<ChannelToggle>;
  },
  inject: [RestChannelService, BleChannelService, IoTChannelService],
};

export const IoTChannelConfigKey = 'Config.IoTChannel';
export const InjectIoTConfig = Inject(IoTChannelConfigKey);
export const IoTChannelConfigEnabledProvider: FactoryProvider = {
  provide: IoTChannelConfigKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): (typeof OPTIONS_TYPE)['iot'] =>
    options.iot,
};

export const BleChannelConfigKey = 'Config.BleChannel';
export const InjectBleConfig = Inject(BleChannelConfigKey);
export const BleChannelConfigEnabledProvider: FactoryProvider = {
  provide: BleChannelConfigKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): (typeof OPTIONS_TYPE)['ble'] =>
    options.ble,
};

export const RestChannelConfigKey = 'Config.RestChannel';
export const InjectRestConfig = Inject(RestChannelConfigKey);
export const RestChannelConfigEnabledProvider: FactoryProvider = {
  provide: RestChannelConfigKey,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: typeof OPTIONS_TYPE): (typeof OPTIONS_TYPE)['rest'] =>
    options.rest,
};
