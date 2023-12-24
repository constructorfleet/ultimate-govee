import { Module } from '@nestjs/common';
import { GoveeEffectService } from './govee-effect.service';
import { GoveeEffectConfiguration } from './govee-effect.config';
import { GoveeConfigModule } from 'src/config/govee-config..module';

@Module({
  imports: [GoveeConfigModule],
  providers: [GoveeEffectConfiguration, GoveeEffectService],
  exports: [GoveeEffectService],
})
export class GoveeEffectModule {}
