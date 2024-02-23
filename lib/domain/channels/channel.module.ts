import { BleChannelModule } from './ble/ble-channel.module';
import { IoTChannelModule } from './iot/iot-channel.module';
import { RestChannelModule } from './rest/rest-channel.module';
import { ChannelModuleOptions } from './channel.types';
import { RestChannelConfigEnabledProvider } from './channel.providers';
import { ConfigurableModuleBuilder, Module } from '@nestjs/common';

export const {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<ChannelModuleOptions>()
  .setClassMethodName('forRoot')
  .setExtras({ isGlobal: true }, (definition, extras) => ({
    ...definition,
    global: extras.isGlobal,
  }))
  .build();

@Module({
  imports: [BleChannelModule, IoTChannelModule, RestChannelModule],
  providers: [RestChannelConfigEnabledProvider],
  exports: [BleChannelModule, IoTChannelModule, RestChannelModule],
})
export class ChannelModule extends ConfigurableModuleClass {}
