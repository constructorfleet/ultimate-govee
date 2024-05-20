import { ConfigurableModuleBuilder } from '@nestjs/common';
export type OpenApiChannelModuleOptions = {
  enabled?: boolean;
  apiKey?: string;
};

export type OpenApiChannelConfiguration = {
  apiKey: string;
};

export const {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<OpenApiChannelModuleOptions>({
  moduleName: 'OpenApiChannelModule',
  optionsInjectionToken: 'OpenApiChannel.Module.Options',
})
  .setExtras({ isGlobal: true }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal,
  }))
  .setClassMethodName('forRoot')
  .build();
