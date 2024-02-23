/* eslint-disable @typescript-eslint/ban-types */
import { FactoryProvider, Inject, Provider } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelToggle, TogglableChannels } from './channel.types';
import { RestChannelService } from './rest';
import { BleChannelService } from './ble/ble-channel.service';
import { IoTChannelService } from './iot';
import { ChannelsModuleOptionsToken } from './index';
import { ChannelModuleOptions } from '.';
import {
  OPTIONS_TYPE as IoTChannelModuleOptions,
  ASYNC_OPTIONS_TYPE as AsyncIotChannelModuleOptions,
} from './iot/iot-channel.types';
import {
  OPTIONS_TYPE as BleChannelModuleOptions,
  ASYNC_OPTIONS_TYPE as AsyncBleChannelModuleOptions,
} from './ble/ble-channel.types';
import {
  OPTIONS_TYPE as RestChannelModuleOptions,
  ASYNC_OPTIONS_TYPE as AsyncRestChannelModuleOptions,
} from './rest/rest-channel.types';

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
  inject: [ChannelsModuleOptionsToken],
  useFactory: (
    options: ChannelModuleOptions,
  ): typeof IoTChannelModuleOptions | typeof AsyncIotChannelModuleOptions =>
    options.iot ?? { enabled: true },
};

export const BleChannelConfigKey = 'Config.BleChannel';
export const InjectBleConfig = Inject(BleChannelConfigKey);
export const BleChannelConfigEnabledProvider: FactoryProvider = {
  provide: BleChannelConfigKey,
  inject: [ChannelsModuleOptionsToken],
  useFactory: (
    options: ChannelModuleOptions,
  ): typeof BleChannelModuleOptions | typeof AsyncBleChannelModuleOptions =>
    options.ble ?? { enabled: false },
};

export const RestChannelConfigKey = 'Config.RestChannel';
export const InjectRestConfig = Inject(RestChannelConfigKey);
export const RestChannelConfigEnabledProvider: FactoryProvider = {
  provide: RestChannelConfigKey,
  inject: [ChannelsModuleOptionsToken],
  useFactory: (
    options: ChannelModuleOptions,
  ): typeof RestChannelModuleOptions | typeof AsyncRestChannelModuleOptions =>
    options.rest ?? {},
};
