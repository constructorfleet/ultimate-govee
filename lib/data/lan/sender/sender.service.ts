import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SenderSocket } from './sender.socket';
import { SenderConfig } from './sender.config';
import stringify from 'json-stringify-safe';

@Injectable()
export class SenderService {
  constructor(
    @Inject(SenderConfig.KEY)
    private readonly config: ConfigType<typeof SenderConfig>,
    private readonly socket: SenderSocket,
  ) {}

  async bind() {
    this.socket.bind();
  }

  sendDeviceCommand() {}

  async scan() {
    await this.socket.send(
      stringify(this.config.scanCommand),
      this.config.scanPort,
      this.config.broadcastAddress,
    );

    console.dir('Sent');
  }

  async deviceCommand(deviceAddress: string, command) {
    await this.socket.send(
      stringify(command),
      this.config.commandPort,
      deviceAddress,
    );
  }
}
