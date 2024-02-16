import { Socket, createSocket } from 'dgram';
import { ValueProvider } from '@nestjs/common';

export const SocketProvider: ValueProvider = {
  provide: Socket,
  useValue: createSocket('udp4'),
};
