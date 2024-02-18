import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IoTModule } from '@constructorfleet/ultimate-govee/data';
import {
  ConnectToIoTCommandHandler,
  IoTSubscribeCommandHandler,
  IoTPublishCommandHandler,
  ConfigureIoTChannelCommandHandler,
} from './handlers';
import { IoTChannelSagas } from './iot-channel.sagas';
import { IoTChannelService } from './iot-channel.service';
import { IoTChannelController } from './iot-channel.controller';
import { DisconnectFromIoTCommandHandler } from './handlers/disconnect-from-iot.handler';

@Module({
  imports: [CqrsModule, IoTModule],
  controllers: [IoTChannelController],
  providers: [
    ConfigureIoTChannelCommandHandler,
    ConnectToIoTCommandHandler,
    DisconnectFromIoTCommandHandler,
    IoTSubscribeCommandHandler,
    IoTPublishCommandHandler,
    IoTChannelSagas,
    IoTChannelService,
  ],
  exports: [
    ConfigureIoTChannelCommandHandler,
    ConnectToIoTCommandHandler,
    DisconnectFromIoTCommandHandler,
    IoTSubscribeCommandHandler,
    IoTChannelSagas,
    IoTChannelService,
  ],
})
export class IoTChannelModule {}
