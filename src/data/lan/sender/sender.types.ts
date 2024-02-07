import { RemoteInfo } from 'dgram';

export enum SenderState {
  UNBOUND,
  BINDING,
  BOUND,
  SCANNING,
  CONNECTED,
  ERROR,
  CLOSED,
}

export type MessageEvent = {
  message: Buffer;
  remoteInfo: RemoteInfo;
};
