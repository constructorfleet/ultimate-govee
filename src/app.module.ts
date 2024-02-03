import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistModule } from './persist';
import { AppService } from './app.service';
import { GoveeAPIModule, IoTModule } from './data';
import { AccountModule, CredentialsConfig } from './domain/accounts';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PersistModule.forRoot(),
    CqrsModule.forRoot(),
    ConfigModule.forFeature(CredentialsConfig),
    GoveeAPIModule,
    IoTModule,
    AccountModule,
  ],
  providers: [AppService],
})
export class AppModule { }
