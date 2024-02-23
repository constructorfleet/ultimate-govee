import { Inject } from '@nestjs/common';
import {
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './channel.module';
import { InjectChannels } from './channel.providers';
export * from './iot';
export * from './ble';
export * from './rest';
import { ChannelModuleOptions, ChannelToggle } from './channel.types';

export { ChannelModuleOptions, ChannelToggle, InjectChannels };

export const AsyncChannelsModuleOptions = typeof ASYNC_OPTIONS_TYPE;
export const ChannelsModuleOptions = typeof OPTIONS_TYPE;
export const ChannelsModuleOptionsToken = MODULE_OPTIONS_TOKEN;
export const InjectChannelsModuleOptions = Inject(MODULE_OPTIONS_TOKEN);
