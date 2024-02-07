import { RemoteInfo } from 'dgram';

export enum ReceiverState {
  UNBOUND,
  BINDING,
  BOUND,
  LISTENING,
  CONNECTED,
  ERROR,
  CLOSED,
}

export type MessageEvent = {
  message: Buffer;
  remoteInfo: RemoteInfo;
};
