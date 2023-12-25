import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IoTConfig } from './iot.config';
import { IoTConnectionFactory } from './iot-connection.factory';
import { IoTService } from './iot.service';

@Module({
  imports: [ConfigModule.forFeature(IoTConfig)],
  providers: [IoTConnectionFactory, IoTService],
  exports: [IoTService],
})
export class IoTModule {}
