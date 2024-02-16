import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IoTChannelModule } from './iot';
import { RestChannelModule } from './rest';

@Module({
  imports: [CqrsModule, RestChannelModule, IoTChannelModule],
  exports: [RestChannelModule, IoTChannelModule],
})
export class ChannelsModule {}
