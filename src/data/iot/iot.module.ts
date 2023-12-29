import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IoTConfig } from './iot.config';
import { IoTClient } from './iot.client';
import { IoTService } from './iot.service';

@Module({
  imports: [ConfigModule.forFeature(IoTConfig)],
  providers: [IoTClient, IoTService],
  exports: [IoTService],
})
export class IoTModule {}
