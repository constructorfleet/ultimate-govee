import { Socket } from 'net';
import { isFunction } from 'rxjs/internal/util/isFunction';

export type IpcClientDisconnectHook = {
  onIpcClientDisconnect(socket?: Socket): any;
};

function hasIpcClientDisconnectHook(
  instance: unknown,
): instance is IpcClientDisconnectHook {
  return isFunction(
    (instance as IpcClientDisconnectHook).onIpcClientDisconnect,
  );
}

export async function ipcClientDisconnectHook(
  instances: unknown[],
  socket?: Socket,
) {
  instances
    .filter(hasIpcClientDisconnectHook)
    .forEach((instance: IpcClientDisconnectHook) =>
      instance.onIpcClientDisconnect(socket),
    );
}
