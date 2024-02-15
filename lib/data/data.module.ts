import { Module } from '@nestjs/common';
import { GoveeAPIModule } from './api';
import { IoTModule } from './iot';
import { CommandRouter } from './command-router';
import { BleModule } from '.';

@Module({
  imports: [GoveeAPIModule, BleModule.forRoot({ enabled: true })],
  providers: [],
  exports: [GoveeAPIModule, BleModule],
})
export class DataModule {}
