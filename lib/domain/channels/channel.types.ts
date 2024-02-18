import { BleChannelService } from './ble/ble-channel.service';
import { IoTChannelService } from './iot/iot-channel.service';
import { RestChannelService } from './rest/rest-channel.service';

export type TogglableChannels = Extract<
  BleChannelService | IoTChannelService | RestChannelService,
  { togglable: true }
>;

export type ChannelToggle = {
  [S in TogglableChannels as S['name']]: Pick<S, 'setConfig' | 'setEnabled'>;
};
