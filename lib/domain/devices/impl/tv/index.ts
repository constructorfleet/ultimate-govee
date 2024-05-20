import { SyncBox } from './sync-box/sync-box';
import { DeviceStates as SyncBoxStates } from './sync-box';
import { DeviceStates as DreamViewStates } from './dreamview';
import { DreamView } from './dreamview/dreamview';

export * from './tv.factory';
export * from './tv.module';
export { SyncBox, DreamView };

export const DeviceStates: string[] = [...SyncBoxStates, ...DreamViewStates];
