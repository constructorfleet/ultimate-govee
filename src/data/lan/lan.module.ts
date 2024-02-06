import { Module } from '@nestjs/common';
import { ReceiverModule } from './receiver/receiver.module';
import { LANDiscovery } from './lan.service';
import { SenderModule } from './sender/sender.module';

@Module({
  imports: [ReceiverModule, SenderModule],
  providers: [LANDiscovery],
  exports: [LANDiscovery],
})
export class LANModule {}
