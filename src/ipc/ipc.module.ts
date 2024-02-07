import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { IpcServer } from './ipc.server';
import { ConfigurableModuleClass } from './ipc.config';
import { IpcClient } from './ipc.client';

@Module({
  imports: [DiscoveryModule],
  providers: [IpcServer, IpcClient],
  exports: [IpcServer, IpcClient],
})
export class IpcModule extends ConfigurableModuleClass {}

@Module({
  imports: [DiscoveryModule],
  providers: [IpcClient],
  exports: [IpcClient],
})
export class IpcClientModule extends ConfigurableModuleClass {}
