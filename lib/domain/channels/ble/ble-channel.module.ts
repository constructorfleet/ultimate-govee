import { BleModule } from '~ultimate-govee-data/ble';
import { Module } from '@nestjs/common';
import { BleChannelService } from './ble-channel.service';
import { ConfigureBleChannelCommandHandler } from './handlers/configure-ble-channel.handler';
import { BlePublishCommandHandler } from './handlers/ble-publish.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { BleRecordDeviceCommandHandler } from './handlers/ble-record-device.handler';
import { BleChannelController } from './ble-channel.controller';

import { BleChannelSagas } from './ble-channel.sagas';
import { DisableBleClientCommandHandler } from './handlers/disable-ble-client.handler';
import { EnableBleClientCommandHandler } from './handlers/enable-ble-client.handler';
import {
  BleChannelConfigDeviceIdsProvider,
  BleChannelConfigEnabledProvider,
} from './ble-channel.providers';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './ble-channel.const';

@Module({
  imports: [CqrsModule, BleModule],
  controllers: [BleChannelController],
  providers: [
    BleChannelConfigDeviceIdsProvider,
    BleChannelConfigEnabledProvider,
    BleChannelService,
    BleChannelSagas,
    DisableBleClientCommandHandler,
    EnableBleClientCommandHandler,
    BleRecordDeviceCommandHandler,
    ConfigureBleChannelCommandHandler,
    BlePublishCommandHandler,
  ],
  exports: [
    BleChannelService,
    BleChannelSagas,
    DisableBleClientCommandHandler,
    EnableBleClientCommandHandler,
    BleRecordDeviceCommandHandler,
    ConfigureBleChannelCommandHandler,
    BlePublishCommandHandler,
    MODULE_OPTIONS_TOKEN,
  ],
})
export class BleChannelModule extends ConfigurableModuleClass {}
