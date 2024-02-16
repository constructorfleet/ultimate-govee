import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SenderConfig } from './sender.config';
import { SocketProvider } from './sender.providers';
import { SenderSocket } from './sender.socket';
import { SenderService } from './sender.service';

@Module({
  imports: [ConfigModule.forFeature(SenderConfig)],
  providers: [SocketProvider, SenderSocket, SenderService],
  exports: [SenderService],
})
export class SenderModule {}
