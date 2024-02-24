import { Inject } from '@nestjs/common';
import {
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} from './channel.const';
import { InjectChannels } from './channel.providers';
import { ChannelModuleOptions, ChannelToggle } from './channel.types';

export { ChannelModule } from './channel.module';
export * from './iot';
export * from './ble';
export * from './rest';

export { ChannelModuleOptions, ChannelToggle, InjectChannels };
export const ChannelsModuleOptionsType = OPTIONS_TYPE;
export const AsyncCHannelsModuleOptionsType = ASYNC_OPTIONS_TYPE;
export const ChannelsModuleOptionsToken = MODULE_OPTIONS_TOKEN;
export const InjectChannelsModuleOptions = Inject(MODULE_OPTIONS_TOKEN);
