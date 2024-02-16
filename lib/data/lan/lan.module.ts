import { Module } from '@nestjs/common';
import { ReceiverModule } from './receiver/receiver.module';
import { LANDiscovery } from './lan.service';
import { SenderModule } from './sender/sender.module';
import { ConfigModule } from '@nestjs/config';
import { LANConfig } from './lan.config';

@Module({
  imports: [ConfigModule.forFeature(LANConfig), ReceiverModule, SenderModule],
  providers: [LANDiscovery],
  exports: [LANDiscovery],
})
export class LANModule {}
