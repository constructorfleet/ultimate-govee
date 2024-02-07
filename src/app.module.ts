import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { IpcModule } from '@govee/ipc';
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
    IpcModule.register({
      id: 'govee',
      appspace: 'data',
      socketRoot: '/workspaces/govee/sockets',
      networkHost: 'localhost',
      networkPort: 3333,
    }),
    DataModule,
    AuthModule,
    ChannelsModule,
    DevicesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
