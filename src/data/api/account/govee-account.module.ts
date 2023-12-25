import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoveeAccountConfig } from './govee-account.configuration';
import { GoveeAuthService as GoveeAccountService } from './govee-account.service';

@Module({
  imports: [ConfigModule.forFeature(GoveeAccountConfig)],
  providers: [GoveeAccountService],
  exports: [GoveeAccountService],
})
export class GoveeAccountModule {}
