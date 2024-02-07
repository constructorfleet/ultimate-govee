import { isFunction } from '@nestjs/common/utils/shared.utils';
import { Socket } from 'net';

export type IpcDisconnectedHook = {
  onIpcDisconnected(): any;
};

function hasIpcDisconnectedHook(
  instance: unknown,
): instance is IpcDisconnectedHook {
  return isFunction((instance as IpcDisconnectedHook).onIpcDisconnected);
}

export async function ipcDisconnectedHook(instances: unknown[]) {
  instances
    .filter(hasIpcDisconnectedHook)
    .forEach((instance: IpcDisconnectedHook) => instance.onIpcDisconnected());
}
