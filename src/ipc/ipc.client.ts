import { Inject, Logger } from '@nestjs/common';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import ipc from 'node-ipc';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Socket } from 'net';
import { IpcModuleOptions, MODULE_OPTIONS_TOKEN } from './ipc.config';
import {
  ipcConnectedHook,
  ipcDisconnectedHook,
  ipcSocketDestroyedHook,
} from './hooks';

export class IpcClient extends ClientProxy {
  protected readonly logger: Logger = new Logger(this.constructor.name);

  protected get channel(): string {
    return this.options.id;
  }

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    protected readonly options: IpcModuleOptions,
    private readonly discovery: DiscoveryService,
  ) {
    super();
  }
  async connect() {
    ipc.config = {
      ...ipc.config,
      ...this.options,
      logger: (data) => {
        this.logger.debug(data);
      },
    };
    ipc.connectTo(this.channel, () => {
      ipc.of[this.channel].on('connect', () => {
        ipc.log(`Client has connected to server`);
        ipcConnectedHook(this.getInstances());
      });
      ipc.of[this.channel].on('disconnect', () => {
        ipc.log(`Client has triggered socket disconnect`);
        ipcDisconnectedHook(this.getInstances());
      });
      ipc.of[this.channel].on(
        'ssocket.disconnected',
        (socket: Socket, destroyedSocketID: string) => {
          ipc.log(`Server has triggered disconnect for client!`);
          ipcSocketDestroyedHook(
            this.getInstances(),
            socket,
            destroyedSocketID,
          );
        },
      );
      ipc.of[this.channel].on('app.message', (data) => {});
    });
  }

  async close() {
    ipc.disconnect(this.channel);
  }

  async dispatchEvent(packet: ReadPacket): Promise<any> {
    ipc.of[this.channel].emit(packet.pattern, packet.data);
    return packet;
  }

  publish(packet: ReadPacket, callback: (packet: WritePacket) => void) {
    ipc.of[this.channel].emit(packet.pattern, packet.data);
    const handleResponse = (data) => {
      ipc.of[this.channel].off(packet.pattern, handleResponse);
      callback({ response: data });
    };
    const handleError = (err) => {
      ipc.of[this.channel].off('err', handleResponse);
      callback({ err });
    };

    ipc.of[this.channel].on(packet.pattern, handleResponse);
    ipc.of[this.channel].on('error', handleError);

    return () => this.teardown(packet, handleResponse, handleError);
  }

  private teardown(
    packet: ReadPacket,
    handler: (data: unknown) => void,
    errorHandler: (err: unknown) => void,
  ) {
    ipc.of[this.channel].off(packet.pattern, handler);
    ipc.of[this.channel].off('error', errorHandler);
  }

  getInstances() {
    const instanceWrappers: InstanceWrapper[] = [
      ...this.discovery.getControllers(),
      ...this.discovery.getProviders(),
    ];
    return instanceWrappers
      .filter((wrapper) => {
        const { instance } = wrapper;
        if (!instance || !Object.getPrototypeOf(instance)) {
          return false;
        }
        return wrapper.isDependencyTreeStatic();
      })
      .map((wrapper) => wrapper.instance);
  }
}
