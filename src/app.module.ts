import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistModule } from './persist';
import { AppService } from './app.service';
import { GoveeAPIModule, IoTModule } from './data';
import { AccountModule } from './domain/account';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PersistModule.forRoot(),
    GoveeAPIModule,
    IoTModule,
    AccountModule,
  ],
  providers: [AppService],
})
export class AppModule {}
