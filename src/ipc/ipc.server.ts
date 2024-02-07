import { Inject, Logger } from '@nestjs/common';

import ipc from 'node-ipc';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { Socket } from 'net';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService } from '@nestjs/core';
import { IpcModuleOptions, MODULE_OPTIONS_TOKEN } from './ipc.config';
import { ipcClientDisconnectHook } from './hooks/ipc-disconnect.hook';
import { ipcInitializedHook } from './hooks/ipc-initialized.hook';

export class IpcServer extends Server implements CustomTransportStrategy {
  protected readonly logger: Logger = new Logger(this.constructor.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: IpcModuleOptions,
    private readonly discovery: DiscoveryService,
  ) {
    super();
  }

  listen(callback: () => void) {
    ipc.config = {
      ...ipc.config,
      ...this.options,
      logger: (data) => {
        this.logger.error(data);
      },
    };
    ipc.serve('sockets', () => {
      ipc.server.on('start', async () => {
        await ipcInitializedHook(this.getInstances(), ipc.server);
        callback();
      });
      this.messageHandlers.forEach((handler, message) => {
        ipc.server.on(message, async (data: unknown, socket: Socket) => {
          const returnValue = await handler(data);
          ipc.server.emit(socket, 'message', returnValue);
        });
      });
      ipc.server.on('socket.disconnected', async (socket: Socket) => {
        ipc.log(`Client at ${socket.remoteAddress} has disconnected`);
        await ipcClientDisconnectHook(this.getInstances(), socket);
      });
    });

    ipc.server.start();
  }

  close() {
    ipc.server.stop();
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
