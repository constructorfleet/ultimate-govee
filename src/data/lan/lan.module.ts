import { Module } from '@nestjs/common';
import { ReceiverModule } from './receiver/receiver.module';
import { LANDiscovery } from './lan.service';
import { SenderModule } from './sender/sender.module';
import { IpcClientModule } from '../../ipc';
import { ConfigModule } from '@nestjs/config';
import { LANConfig } from './lan.config';

@Module({
  imports: [
    // IpcClientModule.register({
    //   id: 'govee',
    //   appspace: 'data',
    //   socketRoot: '/workspaces/govee/sockets',
    //   networkHost: 'localhost',
    //   networkPort: 3333,
    // }),
    ConfigModule.forFeature(LANConfig),
    ReceiverModule,
    SenderModule,
  ],
  providers: [LANDiscovery],
  exports: [LANDiscovery],
})
export class LANModule {}
