import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoveeAccountModule, IoTModule } from '../../data';
import { AccountConfig, CredentialsConfig } from './account.config';
import { AccountService } from './account.service';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [
    ConfigModule.forFeature(CredentialsConfig),
    GoveeAccountModule,
    IoTModule,
    DevicesModule,
  ],
  providers: [AccountConfig, AccountService],
  exports: [AccountService],
})
export class AccountModule {}
