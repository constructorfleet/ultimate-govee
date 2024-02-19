import { BehaviorSubject } from 'rxjs';
import { BleChannelService } from './ble/ble-channel.service';
import { BleChannelModuleOptions } from './ble/ble-channel.types';
import { IoTChannelService } from './iot/iot-channel.service';
import { IoTChannelModuleOptions } from './iot/iot-channel.types';
import { RestChannelService } from './rest/rest-channel.service';
import { RestChannelModuleOptions } from './rest/rest-channel.types';
import { ConfigurableModuleBuilder } from '@nestjs/common';

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
  ble: BleChannelModuleOptions;
  iot: IoTChannelModuleOptions;
  rest: RestChannelModuleOptions;
};

export const {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<ChannelModuleOptions>({
  moduleName: 'ChannelModule',
  optionsInjectionToken: 'Channel.Module.Options',
})
  .setExtras({ isGlobal: true }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal,
  }))
  .setClassMethodName('forRoot')
  .build();
