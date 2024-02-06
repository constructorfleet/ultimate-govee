import { Inject, OnModuleInit } from '@nestjs/common';
import { Socket } from 'dgram';
import { ConfigType } from '@nestjs/config';
import { AddressInfo } from 'net';
import { ReceiverConfig } from './receiver.config';
import { SocketEventHandler } from '../lan.types';

export class ReceiverSocket implements OnModuleInit {
  constructor(
    @Inject(ReceiverConfig.KEY)
    private readonly config: ConfigType<typeof ReceiverConfig>,
    private readonly socket: Socket,
  ) {}

  get address(): AddressInfo {
    return this.socket.address();
  }

  bindHandler(eventHandler: SocketEventHandler) {
    this.socket
      .addListener('close', eventHandler.onClose)
      .addListener('connect', eventHandler.onConnect)
      .addListener('error', eventHandler.onError)
      .addListener('listening', eventHandler.onListening)
      .addListener('message', eventHandler.onMessage);
  }

  bind() {
    this.socket.bind(this.config.receiverPort, () => {
      this.socket.addMembership(
        this.config.broadcastAddress,
        this.config.bindAddress,
      );
    });
  }

  close() {
    this.socket.close();
  }

  onModuleInit() {
    this.bind();
  }
}
