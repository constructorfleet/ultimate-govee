import { BleChannelModule } from './ble/ble-channel.module';
import { IoTChannelModule } from './iot/iot-channel.module';
import { RestChannelModule } from './rest/rest-channel.module';
import {
  BleChannelConfigEnabledProvider,
  IoTChannelConfigEnabledProvider,
  RestChannelConfigEnabledProvider,
  TogglableChannelsProvider,
} from './channel.providers';
import { ConfigurableModuleClass } from './channel.const';
import { Module } from '@nestjs/common';

@Module({
  imports: [BleChannelModule, IoTChannelModule, RestChannelModule],
  providers: [
    TogglableChannelsProvider,
    TogglableChannelsProvider,
    RestChannelConfigEnabledProvider,
    IoTChannelConfigEnabledProvider,
    BleChannelConfigEnabledProvider,
  ],
  exports: [
    BleChannelModule,
    IoTChannelModule,
    RestChannelModule,
    TogglableChannelsProvider,
    TogglableChannelsProvider,
  ],
})
export class ChannelModule extends ConfigurableModuleClass {}
