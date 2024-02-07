import { Inject, OnModuleDestroy } from '@nestjs/common';
import { Socket } from 'dgram';
import { ConfigType } from '@nestjs/config';
import { AddressInfo } from 'net';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReceiverConfig } from './receiver.config';
import { MessageEvent, ReceiverState } from './receiver.types';

export class ReceiverSocket implements OnModuleDestroy {
  readonly socketState = new BehaviorSubject<ReceiverState>(
    ReceiverState.UNBOUND,
  );
  readonly messageBus: Subject<MessageEvent> = new Subject();

  constructor(
    @Inject(ReceiverConfig.KEY)
    private readonly config: ConfigType<typeof ReceiverConfig>,
    private readonly socket: Socket,
  ) {
    this.socket
      .addListener('close', () => this.socketState.next(ReceiverState.CLOSED))
      .addListener('connect', () =>
        this.socketState.next(ReceiverState.CONNECTED),
      )
      .addListener('error', (err) => this.socketState.next(ReceiverState.ERROR))
      .addListener('listening', () =>
        this.socketState.next(ReceiverState.LISTENING),
      )
      .addListener('message', (msg, rinfo) =>
        this.messageBus.next({
          message: msg,
          remoteInfo: rinfo,
        }),
      );
  }

  get address(): AddressInfo {
    return this.socket.address();
  }

  bind() {
    this.socketState.next(ReceiverState.BINDING);
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

  onModuleDestroy() {
    this.close();
  }
}
