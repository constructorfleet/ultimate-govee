import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoveeDiyService } from './govee-diy.service';
import { GoveeDiyConfig } from './govee-diy.config';

@Module({
  imports: [ConfigModule.forFeature(GoveeDiyConfig)],
  providers: [GoveeDiyService],
  exports: [GoveeDiyService],
})
export class GoveeDiyModule {}
