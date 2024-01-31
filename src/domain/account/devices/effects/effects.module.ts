import { Module } from '@nestjs/common';
import { GoveeEffectModule, GoveeDiyModule } from '@govee/data';

@Module({
  imports: [GoveeEffectModule, GoveeDiyModule],
})
export class EffectsModule {}
