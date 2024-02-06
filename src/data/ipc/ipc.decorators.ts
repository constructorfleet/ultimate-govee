import { SubscribeIpcMessage } from 'nest-ipc';

export const IPCMessageSubscribe = (ipcChannel: string) =>
  SubscribeIpcMessage(ipcChannel);
