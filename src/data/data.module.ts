import { Module } from '@nestjs/common';
import { GoveeAPIModule } from './api';
import { IoTModule } from './iot';
import { CommandRouter } from './command-router';

@Module({
  imports: [GoveeAPIModule, IoTModule],
  providers: [CommandRouter],
  exports: [GoveeAPIModule, IoTModule, CommandRouter],
})
export class DataModule {}
