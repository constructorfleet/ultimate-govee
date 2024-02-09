import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './ble.types';
import { BleClient } from './ble.client';

@Module({
  providers: [BleClient],
  exports: [BleClient],
})
export class BleModule extends ConfigurableModuleClass {}
