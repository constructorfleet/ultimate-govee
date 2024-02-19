import { ConfigurableModuleBuilder } from '@nestjs/common';
export type IoTChannelModuleOptions = {
  enabled?: boolean;
};

export const {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<IoTChannelModuleOptions>({
  moduleName: 'IoTChannelModule',
  optionsInjectionToken: 'IoTChannel.Module.Options',
})
  .setClassMethodName('forRoot')
  .build();
