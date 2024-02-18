import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IoTModule } from '@constructorfleet/ultimate-govee/data';
import {
  IoTSubscribeCommandHandler,
  ConfigureIoTChannelCommandHandler,
} from './handlers';
import { IoTChannelService } from './iot-channel.service';
import { IoTChannelController } from './iot-channel.controller';
import { IoTChannelConfigReceivedEventHandler } from './handlers/iot-channel-config-received.handler';

@Module({
  imports: [CqrsModule, IoTModule],
  controllers: [IoTChannelController],
  providers: [
    ConfigureIoTChannelCommandHandler,
    IoTSubscribeCommandHandler,
    IoTChannelConfigReceivedEventHandler,
    IoTChannelService,
  ],
  exports: [
    ConfigureIoTChannelCommandHandler,
    IoTSubscribeCommandHandler,
    IoTChannelConfigReceivedEventHandler,
    IoTChannelService,
  ],
})
export class IoTChannelModule {}
