import { Injectable, Logger } from '@nestjs/common';
import { RemoteInfo } from 'dgram';
import { SocketEventHandler } from '../lan.types';
import { ReceiverSocket } from './receiver.socket';
import { ReceiverState } from './receiver.types';

@Injectable()
export class ReceiverService implements SocketEventHandler {
  private readonly logger: Logger = new Logger(ReceiverService.name);

  constructor(private readonly socket: ReceiverSocket) {}

  async bind() {
    this.logger.log('Binding receiver socket...');
    return await new Promise<boolean>((resolve, reject) => {
      const subscription = this.socket.socketState.subscribe((state) => {
        this.logger.log(`Receiver socket: ${state}`);
        switch (state) {
          case ReceiverState.LISTENING:
            subscription.unsubscribe();
            resolve(true);
            break;
          case ReceiverState.ERROR:
            subscription.unsubscribe();
            reject(new Error('Error binding to receiver socket.'));
            break;
          default:
            break;
        }
      });
      this.socket.bind();
    });
  }

  onClose(): void {
    this.logger.log('Closed');
  }
  onConnect(): void {
    this.logger.log('Connected');
  }
  onError(err: Error): void {
    this.logger.error('Error', err);
  }
  onListening(): void {
    this.logger.debug('Listening');
  }
  onMessage(msg: Buffer, rinfo: RemoteInfo): void {
    try {
      const message = JSON.parse(msg.toString());
      const command = message.msg.cmd;

      switch (command) {
        case 'scan':
          this.logger.log('Device Found', rinfo, message, message.msg.data);
          break;
        case 'deviceStatus':
          this.logger.log('Device status', rinfo.address, message.msg.data);
          break;
        default:
          break;
      }
    } catch (err) {
      // todo
    }
  }
}
