/* eslint-disable @typescript-eslint/ban-types */
import { Inject, Provider } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelToggle, TogglableChannels } from './channel.types';
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
