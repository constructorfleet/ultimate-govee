export * from './iot-channel.service';
export * from './events';
export * from './commands';
export * from './iot-channel.module';
import { OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } from './iot-channel.types';

export const IoTChannelModuleOptions = OPTIONS_TYPE;
export const AsyncIoTChannelModuleOptions = ASYNC_OPTIONS_TYPE;
