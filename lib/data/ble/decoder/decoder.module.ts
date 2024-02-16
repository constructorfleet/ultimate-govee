import { Module } from '@nestjs/common';
import { DecoderService } from './decoder.service';
import { ConfigModule } from '@nestjs/config';
import { DecoderConfig } from './decoder.config';
import { DeviceDecoder } from './decoder.providers';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule, ConfigModule.forFeature(DecoderConfig)],
  providers: [DecoderService, DeviceDecoder],
  exports: [DecoderService, DeviceDecoder.provide],
})
export class DecoderModule {}
