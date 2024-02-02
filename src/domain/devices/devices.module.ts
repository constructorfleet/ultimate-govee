import { Module } from '@nestjs/common';
import {
  DataModule,
  GoveeDeviceModule,
  GoveeDiyModule,
  GoveeEffectModule,
  GoveeProductModule,
} from '@govee/data';
import { DevicesService } from './devices.service';
import { AppliancesModule } from './types/appliances';
import { LightsModule } from './types/lights/lights.module';
import { HomeImprovementModule } from './types/home-improvement/home-improvement.module';
import { DevicesFactory } from './devices.factory';

@Module({
  imports: [
    DataModule,
    GoveeDeviceModule,
    GoveeProductModule,
    GoveeEffectModule,
    GoveeDiyModule,
    AppliancesModule,
    HomeImprovementModule,
    LightsModule,
  ],
  providers: [DevicesService, DevicesFactory],
  exports: [DevicesService],
})
export class DevicesModule {}
