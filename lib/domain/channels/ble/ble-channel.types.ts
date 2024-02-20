import { ConfigurableModuleBuilder } from '@nestjs/common';

export type BleChannelConfig = {
  devices?: string[];
};

export type BleChannelModuleOptions = {
  enabled?: boolean;
  deviceIds?: string[];
};

export const {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<BleChannelModuleOptions>({
  optionsInjectionToken: 'BleChannel.Module.Options',
})
  .setExtras({ isGlobal: true }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal,
  }))
  .setClassMethodName('forRoot')
  .build();
