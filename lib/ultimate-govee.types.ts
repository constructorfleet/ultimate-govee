import { ChannelModuleOptions } from './domain/channels/channel.types';
import {
  OPTIONS_TYPE as AuthModuleOptions,
  ASYNC_OPTIONS_TYPE as AsyncAuthModuleOptions,
} from './domain/auth/auth.types';
import { ConfigurableModuleBuilder } from '@nestjs/common';
import {
  AsyncPersistModuleOptionsType,
  PersistModuleOptionsType,
} from './persist/persist.module';

export type UltimateGoveeModuleOptions = {
  persist?:
    | typeof PersistModuleOptionsType
    | typeof AsyncPersistModuleOptionsType;
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
