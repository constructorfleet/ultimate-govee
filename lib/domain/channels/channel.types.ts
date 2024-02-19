import { BleChannelService } from './ble/ble-channel.service';
import { BleChannelModuleOptions } from './ble/ble-channel.types';
import { IoTChannelService } from './iot/iot-channel.service';
import { IoTChannelModuleOptions } from './iot/iot-channel.types';
import { RestChannelService } from './rest/rest-channel.service';

export type TogglableChannels = Extract<
  BleChannelService | IoTChannelService | RestChannelService,
  { togglable: true }
>;

export type ChannelToggle = {
  [S in TogglableChannels as S['name']]: Pick<S, 'setConfig' | 'setEnabled'>;
};

export type ChannelModuleOptions = {
  ble: BleChannelModuleOptions,
  iot: IoTChannelModuleOptions,
  rest:
}