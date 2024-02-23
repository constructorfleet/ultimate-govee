export * from './iot';
export * from './ble';
export * from './rest';
export * from './channels.module';
import { OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } from './channel.types';

export const ChannelModuleOptions = typeof OPTIONS_TYPE;
export const AsyncChannelModuleOptions = typeof ASYNC_OPTIONS_TYPE;
