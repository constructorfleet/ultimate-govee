import { BleModule } from '@govee/data/ble';
import { Module } from '@nestjs/common';
import { BleChannelService } from './ble-channel.service';

@Module({
  imports: [BleModule],
  providers: [BleChannelService],
  exports: [BleChannelService],
})
export class BleChannelModule {}
