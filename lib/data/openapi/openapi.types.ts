import { ConfigurableModuleBuilder } from '@nestjs/common';
import { MqttMessageHandler } from '~ultimate-govee-common';
import { OpenAPIModuleOptionsKey } from './openapi.const';
import { OpenAPIMqttPacket } from './openapi.models';

export type MQTTProtocol =
  | 'wss'
  | 'ws'
  | 'mqtt'
  | 'mqtts'
  | 'tcp'
  | 'ssl'
  | 'wx'
  | 'wxs';

export type OpenAPIConfig = {
  deviceListUrl: string;
  deviceControlUrl: string;
  deviceStateUrl: string;
  deviceLightScenesUrl: string;
  deviceDIYScenesUrl: string;
  mqttBrokerUrl: string;
};

export type OpenAPIMqttMessageHandler = MqttMessageHandler<OpenAPIMqttPacket>;

export const {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<OpenAPIConfig>({
  moduleName: 'OpenAPIModule',
  optionsInjectionToken: OpenAPIModuleOptionsKey,
})
  .setClassMethodName('forRoot')
  .build();
