import { isFunction } from 'rxjs/internal/util/isFunction';
import { IpcServer } from '../ipc.types';

export type IpcInitializedHook = {
  onIpcInitialized(server): any;
};

function hasOnIpcInitializedHook(
  instance: unknown,
): instance is IpcInitializedHook {
  return isFunction((instance as IpcInitializedHook).onIpcInitialized);
}

export async function ipcInitializedHook(
  instances: unknown[],
  server?: IpcServer,
) {
  instances
    .filter(hasOnIpcInitializedHook)
    .forEach((instance: IpcInitializedHook) =>
      instance.onIpcInitialized(server),
    );
}
