import { Injectable } from '@nestjs/common';
import { Socket } from 'dgram';

@Injectable()
export class SenderSocket {
  constructor(private readonly socket: Socket) {}

  async send(
    msg: string | Uint8Array | readonly any[],
    port: number,
    address?: string,
  ) {
    console.dir({ msg, port, address });
    return new Promise<void>((resolve, reject) => {
      this.socket.send(msg, port, address, (error) => {
        if (error !== undefined) {
          console.log(`send`, error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  bind() {
    this.socket.bind();
  }

  close() {
    this.socket.close();
  }
}
