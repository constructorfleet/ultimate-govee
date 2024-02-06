import { Injectable, Logger } from '@nestjs/common';
import { RemoteInfo } from 'dgram';
import { SocketEventHandler } from '../lan.types';
import { ReceiverSocket } from './receiver.socket';

@Injectable()
export class ReceiverService implements SocketEventHandler {
  private readonly logger: Logger = new Logger(ReceiverService.name);
  constructor(private readonly socket: ReceiverSocket) {
    this.socket.bindHandler(this);
  }

  bind() {
    this.socket.bind();
  }

  onClose(): void {
    throw new Error('Method not implemented.');
  }
  onConnect(): void {
    throw new Error('Method not implemented.');
  }
  onError(err: Error): void {
    throw new Error('Method not implemented.');
  }
  onListening(): void {
    throw new Error('Method not implemented.');
  }
  onMessage(msg: Buffer, rinfo: RemoteInfo): void {
    throw new Error('Method not implemented.');
  }
}
