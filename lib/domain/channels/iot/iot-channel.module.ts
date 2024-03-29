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
import { IoTChannelConfigEnabledProvider } from './iot-channel.providers';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './iot-channel.types';

@Module({
  imports: [CqrsModule, IoTModule],
  controllers: [IoTChannelController],
  providers: [
    IoTChannelConfigEnabledProvider,
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
    MODULE_OPTIONS_TOKEN,
  ],
})
export class IoTChannelModule extends ConfigurableModuleClass {}
