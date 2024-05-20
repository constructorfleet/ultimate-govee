import { Module } from '@nestjs/common';
import { GoveeAccountModule } from './account';
import { GoveeDeviceModule } from './device';
import { GoveeEffectModule } from './effect';
import { GoveeProductModule } from './product';
import { GoveeDiyModule } from './diy';

@Module({
  imports: [
    GoveeAccountModule,
    GoveeDeviceModule,
    GoveeEffectModule,
    GoveeProductModule,
    GoveeDiyModule,
  ],
  providers: [
    GoveeAccountModule,
    GoveeDeviceModule,
    GoveeEffectModule,
    GoveeProductModule,
    GoveeDiyModule,
  ],
  exports: [
    GoveeAccountModule,
    GoveeDeviceModule,
    GoveeEffectModule,
    GoveeProductModule,
    GoveeDiyModule,
  ],
})
export class GoveeAPIModule {}
