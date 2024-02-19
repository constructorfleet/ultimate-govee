import { AccountAuthData } from '../../auth/auth.state';
import { ConfigurableModuleBuilder } from '@nestjs/common';

export type RestChannelConfig = Omit<AccountAuthData, 'oauth'>;

export type RestChannelModuleOptions = RestChannelConfig;

export const {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder({
  moduleName: 'RestChannelModule',
  optionsInjectionToken: 'RestChannel.Module.Options',
})
  .setExtras({ isGlobal: true }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal,
  }))
  .setClassMethodName('forRoot')
  .build();
