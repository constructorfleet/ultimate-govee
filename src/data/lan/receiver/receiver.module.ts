import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReceiverConfig } from './receiver.config';
import { ReceiverService } from './receiver.service';
import { ReceiverSocket } from './receiver.socket';
import { SocketProvider } from './receiver.providers';

@Module({
  imports: [ConfigModule.forFeature(ReceiverConfig)],
  providers: [ReceiverService, ReceiverSocket, SocketProvider],
  exports: [ReceiverService],
})
export class ReceiverModule {}
