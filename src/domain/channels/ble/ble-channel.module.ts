import { BleModule } from '@govee/data/ble';
import { Module } from '@nestjs/common';
import { BleChannelService } from './ble-channel.service';
import { ConfigureBleChannelCommandHandler } from './handlers/configure-ble-channel.handler';
import { BlePublishCommandHandler } from './handlers/ble-publish.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { BleRecordDeviceCommandHandler } from './handlers/ble-record-device.handler';
import { BleChannelController } from './ble-channel.controller';
import { ConfigModule } from '@nestjs/config';
import { BleConfig } from '@govee/data/ble/ble.options';
import { BleChannelSagas } from './ble-channel.sagas';

@Module({
  imports: [
    CqrsModule,
    BleModule.forRoot({ enabled: false }),
    ConfigModule.forFeature(BleConfig),
  ],
  controllers: [BleChannelController],
  providers: [
    BleChannelService,
    BleChannelSagas,
    BleRecordDeviceCommandHandler,
    ConfigureBleChannelCommandHandler,
    BlePublishCommandHandler,
  ],
  exports: [
    BleChannelService,
    BleChannelSagas,
    BleRecordDeviceCommandHandler,
    ConfigureBleChannelCommandHandler,
    BlePublishCommandHandler,
  ],
})
export class BleChannelModule {}
