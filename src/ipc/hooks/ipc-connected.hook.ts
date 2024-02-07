import { isFunction } from '@nestjs/common/utils/shared.utils';

export type IpcConnectedHook = {
  onIpcConnected(): any;
};

function hasIpcConnectedHook(instance: unknown): instance is IpcConnectedHook {
  return isFunction((instance as IpcConnectedHook).onIpcConnected);
}

export async function ipcConnectedHook(instances: unknown[]) {
  instances
    .filter(hasIpcConnectedHook)
    .forEach((instance: IpcConnectedHook) => instance.onIpcConnected());
}
