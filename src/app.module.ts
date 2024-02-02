import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistModule } from './persist';
import { AppService } from './app.service';
import { GoveeAPIModule, IoTModule } from './data';
import { AccountModule } from './domain/account';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PersistModule.forRoot(),
    CqrsModule.forRoot(),
    GoveeAPIModule,
    IoTModule,
    AccountModule,
  ],
  providers: [AppService],
})
export class AppModule {}
