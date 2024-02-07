import { isFunction } from '@nestjs/common/utils/shared.utils';
import { Socket } from 'net';

export type IpcSocketDestroyedHook = {
  onIpcSocketDestroyed(socket?: Socket, destroyedSocketID?: string): any;
};

function hasIpcSocketDestroyedHook(
  instance: unknown,
): instance is IpcSocketDestroyedHook {
  return isFunction((instance as IpcSocketDestroyedHook).onIpcSocketDestroyed);
}

export async function ipcSocketDestroyedHook(
  instances: unknown[],
  socket?: Socket,
  destroyedSocketID?: string,
) {
  instances
    .filter(hasIpcSocketDestroyedHook)
    .forEach((instance: IpcSocketDestroyedHook) =>
      instance.onIpcSocketDestroyed(socket, destroyedSocketID),
    );
}
