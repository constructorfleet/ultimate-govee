import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoveeDeviceConfig } from './govee-device.config';
import { GoveeDeviceService } from './govee-device.service';

@Module({
  imports: [ConfigModule.forFeature(GoveeDeviceConfig)],
  providers: [GoveeDeviceService],
  exports: [GoveeDeviceService],
})
export class GoveeDeviceModule {}
