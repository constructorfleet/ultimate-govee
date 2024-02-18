import { BleModule } from '@constructorfleet/ultimate-govee/data/ble';
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

@Module({
  imports: [CqrsModule, BleModule],
  controllers: [BleChannelController],
  providers: [
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
  ],
})
export class BleChannelModule {}
