import { ChannelModuleOptions } from './domain/channels/channel.types';
import {
  OPTIONS_TYPE as AuthModuleOptions,
  ASYNC_OPTIONS_TYPE as AsyncAuthModuleOptions,
} from './domain/auth/auth.types';
import { ConfigurableModuleBuilder } from '@nestjs/common';
import {
  OPTIONS_TYPE as PersistModuleOptions,
  ASYNC_OPTIONS_TYPE as AsyncPersistModuleOptions,
} from './persist/persist.module';

export type UltimateGoveeModuleOptions = {
  persist?: typeof PersistModuleOptions | typeof AsyncPersistModuleOptions;
  auth?: typeof AuthModuleOptions | typeof AsyncAuthModuleOptions;
  channels?: ChannelModuleOptions;
};

export const {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<UltimateGoveeModuleOptions>({
  moduleName: 'UltimateGoveeModule',
  optionsInjectionToken: 'UltimateGovee.Module.Options',
})
  .setClassMethodName('forRoot')
  .setExtras({ isGlobal: true }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal,
  }))
  .build();
