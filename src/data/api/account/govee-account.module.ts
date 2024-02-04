import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistModule } from '@govee/persist';
import { GoveeAccountConfig } from './govee-account.configuration';
import { GoveeAccountService } from './govee-account.service';

@Module({
  imports: [ConfigModule.forFeature(GoveeAccountConfig), PersistModule],
  providers: [GoveeAccountService],
  exports: [GoveeAccountService],
})
export class GoveeAccountModule {}
