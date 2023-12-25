import { Module } from '@nestjs/common';
import { GoveeConfigModule } from '../../config';
import { GoveeAccountModule } from './account';
import { GoveeDeviceModule } from './device';
import { GoveeEffectModule } from './effect';
import { GoveeProductModule } from './product';

@Module({
  imports: [
    GoveeConfigModule,
    GoveeAccountModule,
    GoveeDeviceModule,
    GoveeEffectModule,
    GoveeProductModule,
  ],
  providers: [
    GoveeAccountModule,
    GoveeDeviceModule,
    GoveeEffectModule,
    GoveeProductModule,
  ],
})
export class GoveeAPIModule {}
