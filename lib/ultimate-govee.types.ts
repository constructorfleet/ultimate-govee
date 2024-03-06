import { OPTIONS_TYPE as AuthModuleOptions } from './domain/auth/auth.types';
import { ConfigurableModuleBuilder } from '@nestjs/common';
import {
  IoTChannelModuleOptions,
  BleChannelModuleOptions,
  RestChannelModuleOptions,
} from './domain/channels/index';
import { OPTIONS_TYPE as PersistModuleOptions } from './persist/persist.providers';

export type UltimateGoveeModuleOptions = {
  persist?: typeof PersistModuleOptions;
  auth?: typeof AuthModuleOptions;
  channels?: {
    iot?: typeof IoTChannelModuleOptions;
    ble?: typeof BleChannelModuleOptions;
    rest?: typeof RestChannelModuleOptions;
  };
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
