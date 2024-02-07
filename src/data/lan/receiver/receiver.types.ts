import { RemoteInfo } from 'dgram';

export enum ReceiverState {
  UNBOUND = 'UNBOUND',
  BINDING = 'BINDING',
  BOUND = 'BOUND',
  LISTENING = 'LISTENING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  CLOSED = 'CLOSED',
}

export type MessageEvent = {
  message: Buffer;
  remoteInfo: RemoteInfo;
};
