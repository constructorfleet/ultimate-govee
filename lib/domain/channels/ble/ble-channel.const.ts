import { ConfigurableModuleBuilder } from '@nestjs/common';
import { BleChannelModuleOptions } from './ble-channel.types';

export const BleChannelModuleOptionsKey = 'BleChannel.Module.Options';

export const {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<BleChannelModuleOptions>({
  optionsInjectionToken: BleChannelModuleOptionsKey,
})
  .setExtras({ isGlobal: true }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal,
  }))
  .setClassMethodName('forRoot')
  .build();
