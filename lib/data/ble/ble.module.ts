import { Module } from '@nestjs/common';
import { BleClient } from './ble.client';
import { DecoderModule } from './decoder/decoder.module';
import { BleConfig } from './ble.options';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [DecoderModule, ConfigModule.forFeature(BleConfig)],
  providers: [BleClient],
  exports: [BleClient],
})
export class BleModule {}
