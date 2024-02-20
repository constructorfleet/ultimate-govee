import { ExistingProvider, Inject, ValueProvider } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './rest-channel.types';

export const RestChannelConfigEnabledKey = 'Config.RestChannel.Enabled';
export const InjectEnabled = Inject(RestChannelConfigEnabledKey);
export const RestChannelConfigEnabledProvider: ValueProvider = {
  provide: RestChannelConfigEnabledKey,
  useValue: true,
};

export const RestChannelConfigAuthKey = 'Config.RestChannel.Auth';
export const InjectAuth = Inject(RestChannelConfigAuthKey);
export const RestChannelConfigAuthProvider: ExistingProvider = {
  provide: RestChannelConfigAuthKey,
  useExisting: MODULE_OPTIONS_TOKEN,
};
