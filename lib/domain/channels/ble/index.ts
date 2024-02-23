export { BleChannelConfig } from './ble-channel.types';
export { BleChannelModule } from './ble-channel.module';
import { OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } from './ble-channel.types';

export const BleChannelModuleOptions = typeof OPTIONS_TYPE;
export const AsyncBleChannelModuleOptions = typeof ASYNC_OPTIONS_TYPE;
