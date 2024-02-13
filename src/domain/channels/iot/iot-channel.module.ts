import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DataModule, IoTModule } from '@govee/data';
import {
  ConnectToIoTCommandHandler,
  IoTSubscribeCommandHandler,
  IoTPublishCommandHandler,
  ConfigureIoTChannelCommandHandler,
} from './handlers';
import { IoTChannelSagas } from './iot-channel.sagas';
import { IoTChannelService } from './iot-channel.service';
import { IoTChannelController } from './iot-channel.controller';

@Module({
  imports: [CqrsModule, IoTModule],
  controllers: [IoTChannelController],
  providers: [
    ConfigureIoTChannelCommandHandler,
    ConnectToIoTCommandHandler,
    IoTSubscribeCommandHandler,
    IoTPublishCommandHandler,
    IoTChannelSagas,
    IoTChannelService,
  ],
  exports: [
    ConfigureIoTChannelCommandHandler,
    ConnectToIoTCommandHandler,
    IoTSubscribeCommandHandler,
    IoTChannelSagas,
    IoTChannelService,
  ],
})
export class IoTChannelModule {}
