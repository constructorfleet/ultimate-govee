import { Module } from '@nestjs/common';
import { GoveeAccountModule } from './account';
import { GoveeDeviceModule } from './device';
import { GoveeEffectModule } from './effect';
import { GoveeProductModule } from './product';

@Module({
  imports: [
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
  exports: [
    GoveeAccountModule,
    GoveeDeviceModule,
    GoveeEffectModule,
    GoveeProductModule,
  ],
})
export class GoveeAPIModule {}
