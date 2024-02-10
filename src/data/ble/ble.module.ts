import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './ble.types';
import { BleClient } from './ble.client';
import { DecoderModule } from './decoder/decoder.module';

@Module({
  imports: [DecoderModule],
  providers: [BleClient],
  exports: [BleClient],
})
export class BleModule extends ConfigurableModuleClass {}
