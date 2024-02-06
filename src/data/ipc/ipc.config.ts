import { registerAs } from '@nestjs/config';

export const IPCConfig = (
  appSpace: string,
  networkPort: number,
  networkHost: string = 'localhost',
) =>
  registerAs(`Config.IPC.${appSpace}`, () => ({
    appSpace,
    socketRoot: `${process.env.SOCKET_ROOT || 'sockets'}/${appSpace}`,
    networkHost,
    networkPort,
  }));
