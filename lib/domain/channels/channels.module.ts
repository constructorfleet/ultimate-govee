import { DynamicModule, Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IoTChannelModule } from './iot';
import { RestChannelModule } from './rest';
import { BleChannelModule } from './ble/ble-channel.module';
import { DiscoveryModule } from '@nestjs/core';
import { TogglableChannelsProvider } from './channel.providers';

@Global()
@Module({})
export class ChannelsModule {
  static forRoot(): DynamicModule {
    return {
      module: ChannelsModule,
      imports: [
        DiscoveryModule,
        CqrsModule,
        RestChannelModule,
        BleChannelModule,
        IoTChannelModule,
      ],
      providers: [TogglableChannelsProvider],
      exports: [
        TogglableChannelsProvider,
        RestChannelModule,
        BleChannelModule,
        IoTChannelModule,
      ],
    };
  }
}
