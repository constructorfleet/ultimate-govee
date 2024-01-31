import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IoTModule, GoveeAccountModule } from '@govee/data';
import { AccountConfig, CredentialsConfig } from './account.config';
import { AccountService } from './account.service';
import { DevicesModule } from './devices/devices.module';
import { AccountStateProvider } from './account.providers';

@Module({
  imports: [
    ConfigModule.forFeature(CredentialsConfig),
    GoveeAccountModule,
    IoTModule,
    DevicesModule,
  ],
  providers: [AccountConfig, AccountService, AccountStateProvider],
  exports: [AccountService, AccountStateProvider],
})
export class AccountModule {}
