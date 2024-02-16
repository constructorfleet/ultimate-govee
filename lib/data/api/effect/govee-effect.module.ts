import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoveeEffectService } from './govee-effect.service';
import { GoveeEffectConfig } from './govee-effect.config';

@Module({
  imports: [ConfigModule.forFeature(GoveeEffectConfig)],
  providers: [GoveeEffectService],
  exports: [GoveeEffectService],
})
export class GoveeEffectModule {}
