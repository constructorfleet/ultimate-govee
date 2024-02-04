import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistModule } from './persist';
import { AppService } from './app.service';
import { DataModule } from './data';
import { AuthModule } from './domain/auth';
import { ChannelsModule } from './domain/channels';
import { CredentialsConfig } from './config/govee.config';
import { DevicesModule } from './domain/devices';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PersistModule.forRoot(),
    CqrsModule.forRoot(),
    ConfigModule.forFeature(CredentialsConfig),
    DataModule,
    AuthModule,
    ChannelsModule,
    DevicesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
