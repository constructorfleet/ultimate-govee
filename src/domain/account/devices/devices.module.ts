import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { GoveeDeviceModule } from '../../../data';

@Module({
  imports: [GoveeDeviceModule],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
