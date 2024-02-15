import { RemoteInfo } from 'dgram';

export type OnClose = {
  onClose(): void;
};
export type OnConnect = {
  onConnect(): void;
};

export type OnError = {
  onError(err: Error): void;
};

export type OnListening = {
  onListening(): void;
};

export type OnMessage = {
  onMessage(msg: Buffer, rinfo: RemoteInfo): void;
};

export type SocketEventHandler = OnClose &
  OnConnect &
  OnError &
  OnListening &
  OnMessage;

export type SocketBinder = {
  bind(): void;
};
