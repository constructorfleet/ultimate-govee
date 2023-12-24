import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoveeAuthConfiguration } from './govee-auth.configuration';
import { GoveeAuthService } from './govee-auth.service';

@Module({
  imports: [ConfigModule.forFeature(GoveeAuthConfiguration)],
  providers: [GoveeAuthService],
  exports: [GoveeAuthService],
})
export class GoveeAuthModule {}
