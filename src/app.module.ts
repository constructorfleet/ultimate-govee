import { Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommandBus, CqrsModule, EventBus, QueryBus } from '@nestjs/cqrs';
import { PersistModule } from './persist';
import { AppService } from './app.service';
import { AuthModule } from './domain/auth';
import { ChannelsModule } from './domain/channels';
import { DevicesModule } from './domain/devices';
import { GoveeConfiguration } from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PersistModule.forRoot(),
    CqrsModule.forRoot(),
    AuthModule,
    ChannelsModule,
    DevicesModule,
  ],
  providers: [GoveeConfiguration, AppService],
})
export class AppModule {}
