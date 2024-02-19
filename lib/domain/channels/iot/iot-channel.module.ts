import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IoTModule } from '~ultimate-govee-data';
import {
  IoTSubscribeCommandHandler,
  ConfigureIoTChannelCommandHandler,
} from './handlers';
import { IoTChannelService } from './iot-channel.service';
import { IoTChannelController } from './iot-channel.controller';
import { IoTChannelConfigReceivedEventHandler } from './handlers/iot-channel-config-received.handler';
import { IoTChannelConfigEnabledProfovider } from './iot-channel.providers';
import { ConfigurableModuleClass } from './iot-channel.types';

@Module({
  imports: [CqrsModule, IoTModule],
  controllers: [IoTChannelController],
  providers: [
    IoTChannelConfigEnabledProfovider,
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
export class IoTChannelModule extends ConfigurableModuleClass {}
