import { BehaviorSubject } from 'rxjs';
import { BleChannelService } from './ble/ble-channel.service';
import {
  OPTIONS_TYPE as BleModuleOptions,
  ASYNC_OPTIONS_TYPE as AsyncBleModuleOptions,
} from './ble/ble-channel.types';
import { IoTChannelService } from './iot/iot-channel.service';
import {
  OPTIONS_TYPE as IoTModuleOptions,
  ASYNC_OPTIONS_TYPE as AsyncIoTModuleOptions,
} from './iot/iot-channel.types';
import { RestChannelService } from './rest/rest-channel.service';
import {
  OPTIONS_TYPE as RestModuleOptions,
  ASYNC_OPTIONS_TYPE as AsyncRestModuleOptions,
} from './rest/rest-channel.types';

export type TogglableChannels = Extract<
  BleChannelService | IoTChannelService | RestChannelService,
  { togglable: true }
>;

export type ChannelToggle = {
  [S in TogglableChannels as S['name']]: Pick<S, 'setConfig' | 'setEnabled'>;
};

export type ChannelState<TConfig extends object> = {
  config: BehaviorSubject<TConfig | undefined>;
  enabled: BehaviorSubject<boolean | undefined>;
};

export type Togglable = {
  togglable: boolean;
};

export type ChannelModuleOptions = {
  ble?: typeof BleModuleOptions | typeof AsyncBleModuleOptions;
  iot?: typeof IoTModuleOptions | typeof AsyncIoTModuleOptions;
  rest?: typeof RestModuleOptions | typeof AsyncRestModuleOptions;
};
