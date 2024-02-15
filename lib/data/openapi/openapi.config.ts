import { FactoryProvider } from '@nestjs/common';
import { OpenAPIMessage } from './models/mqtt-message';
import { goveeAPIKeyHeaders } from '../utils';

const OpenAPIConfigKey = 'Configuration.OpenAPI';
const deviceListUrl =
  'https://openapi.api.govee.com/router/api/v1/user/devices';
const deviceControlUrl =
  'https://openapi.api.govee.com/router/api/v1/device/control';
const deviceStateUrl =
  'https://openapi.api.govee.com/router/api/v1/device/state';
const deviceLightScenesUrl =
  'https://openapi.api.govee.com/router/api/v1/device/scenes';
const deviceDIYScenesUrl =
  'https://openapi.api.govee.com/router/api/v1/device/diy-scenes';
const mqttBrokerUrl = 'mqtts://mqtt.openapi.govee.com';
export type MessageHandler = (
  topic: string,
  message: OpenAPIMessage,
  payload: Buffer,
) => void;

export type OpenAPIConfig = {
  apiKey: string;
  deviceListUrl: string;
  deviceControlUrl: string;
  deviceStateUrl: string;
  deviceLightScenesUrl: string;
  deviceDIYScenesUrl: string;
  mqttBrokerUrl: string;
  messageHandler: MessageHandler;
  headers: (apiKey: string) => Record<string, string>;
};

export const OpenAPIConfig: FactoryProvider = {
  provide: OpenAPIConfigKey,
  useFactory: (): OpenAPIConfig => ({
    apiKey: '',
    deviceListUrl,
    deviceControlUrl,
    deviceStateUrl,
    deviceLightScenesUrl,
    deviceDIYScenesUrl,
    mqttBrokerUrl,
    messageHandler: () => {},
    headers: goveeAPIKeyHeaders,
  }),
};
