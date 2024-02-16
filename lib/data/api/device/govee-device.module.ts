import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoveeDeviceConfig } from './govee-device.config';
import { GoveeDeviceService } from './govee-device.service';
import { GoveeDiyModule } from '../diy/govee-diy.module';

@Module({
  imports: [ConfigModule.forFeature(GoveeDeviceConfig), GoveeDiyModule],
  providers: [GoveeDeviceService],
  exports: [GoveeDeviceService],
})
export class GoveeDeviceModule {}
