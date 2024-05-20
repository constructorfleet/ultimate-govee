import { Module } from '@nestjs/common';
import {
  LastMqttClientProvider,
  LastMqttConnectionProvider,
  MqttClientFactoryProvider,
  MqttBrokerProvider,
  MqttDeserializerProvider,
} from './mqtt.providers';
import { MqttService } from './mqtt.service';
import { ConfigurableModuleClass } from './mqtt.types';

@Module({
  providers: [
    MqttBrokerProvider,
    LastMqttClientProvider,
    LastMqttConnectionProvider,
    MqttDeserializerProvider,
    MqttClientFactoryProvider,
    MqttService,
  ],
  exports: [MqttService],
})
export class MqttModule extends ConfigurableModuleClass {}
