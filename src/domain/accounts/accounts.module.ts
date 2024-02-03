import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataModule } from '@govee/data';
import { CqrsModule } from '@nestjs/cqrs';
import { AccountConfig, CredentialsConfig } from './accounts.config';
import { AccountService } from './accounts.service';
import { DevicesModule } from '../devices/devices.module';
import { AccountStateProvider } from './accounts.providers';
import { AuthenticateHandler } from './accounts.handlers';

@Module({
  imports: [
    ConfigModule.forFeature(CredentialsConfig),
    CqrsModule,
    DataModule,
    DevicesModule,
  ],
  providers: [AccountConfig, AccountService, AccountStateProvider, AuthenticateHandler],
  exports: [AccountConfig, AccountService, AccountStateProvider, AuthenticateHandler],
})
export class AccountModule { }
