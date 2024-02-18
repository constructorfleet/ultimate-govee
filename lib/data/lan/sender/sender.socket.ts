import { Injectable } from '@nestjs/common';
import { Socket } from 'dgram';
import { BehaviorSubject } from 'rxjs';
import { SenderState } from './sender.types';

@Injectable()
export class SenderSocket {
  readonly socketState = new BehaviorSubject<SenderState>(SenderState.UNBOUND);
  constructor(private readonly socket: Socket) {}

  async send(
    msg: string | Uint8Array | readonly any[],
    port: number,
    address?: string,
  ) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        this.socket.send(msg, port, address, (error) => {
          if (error) {
            console.log('send', error);
          } else {
            resolve();
          }
        });
      }, 100);
    });
  }

  bind() {
    this.socket.bind();
  }

  close() {
    this.socket.close();
  }
}
