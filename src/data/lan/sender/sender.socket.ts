import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Socket } from 'dgram';

@Injectable()
export class SenderSocket implements OnApplicationBootstrap {
  constructor(private readonly socket: Socket) {}

  async send(
    msg: string | Uint8Array | readonly any[],
    port: number,
    address?: string,
  ) {
    return new Promise<void>((resolve, reject) => {
      this.socket.send(msg, port, address, (error) => {
        if (error !== undefined) {
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

  onApplicationBootstrap() {
    this.bind();
  }
}
