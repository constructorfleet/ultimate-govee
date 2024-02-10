import { Module } from '@nestjs/common';
import { GoveeAPIModule } from './api';
import { IoTModule } from './iot';
import { CommandRouter } from './command-router';
import { BleModule } from '.';

@Module({
  imports: [GoveeAPIModule, IoTModule, BleModule.forRoot({ enabled: false })],
  providers: [CommandRouter],
  exports: [GoveeAPIModule, IoTModule, BleModule, CommandRouter],
})
export class DataModule {}
