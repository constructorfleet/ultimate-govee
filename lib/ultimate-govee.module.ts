import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistModule } from './persist';
import { UltimateGoveeService } from './ultimate-govee.service';
import { AuthModule } from './domain/auth';
import { ChannelsModule } from './domain/channels';
import { DevicesModule } from './domain/devices';
import { UltimateGoveeConfiguration } from './ultimate-govee.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PersistModule.forRoot(),
    CqrsModule.forRoot(),
    AuthModule,
    ChannelsModule,
    DevicesModule,
  ],
  providers: [UltimateGoveeConfiguration, UltimateGoveeService],
})
export class UltimateGoveeModule {}
new Date().toUTCString();
