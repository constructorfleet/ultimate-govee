import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import {
  GoveeDeviceModule,
  GoveeDiyModule,
  GoveeEffectModule,
  GoveeProductModule,
} from '../../../data';
import { AppliancesModule } from './types/appliances';
import { LightsModule } from './types/lights/lights.module';
import { DevicesFactory } from './devices.factory';

@Module({
  imports: [
    GoveeDeviceModule,
    GoveeProductModule,
    GoveeEffectModule,
    GoveeDiyModule,
    AppliancesModule,
    LightsModule,
  ],
  providers: [DevicesService, DevicesFactory],
  exports: [DevicesService],
})
export class DevicesModule {}
