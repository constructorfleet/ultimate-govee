import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IoTChannelModule } from './iot';
import { RestChannelModule } from './rest';
import { BleChannelModule } from './ble/ble-channel.module';

@Module({
  imports: [CqrsModule, RestChannelModule, IoTChannelModule],
  exports: [RestChannelModule, IoTChannelModule],
})
export class ChannelsModule {}
