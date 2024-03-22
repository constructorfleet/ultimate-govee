import { SyncBox } from './sync-box/sync-box';
import { DeviceStates as SyncBoxStates } from './sync-box';

export * from './tv.factory';
export * from './tv.module';
export { SyncBox };

export const DeviceStates: string[] = [...SyncBoxStates];
