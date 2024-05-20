import { ValueProvider } from '@nestjs/common';
import {
  deviceControlUrl,
  deviceDIYScenesUrl,
  deviceLightScenesUrl,
  deviceListUrl,
  deviceStateUrl,
  OpenAPIConfigKey,
} from './openapi.const';

export const OpenAPIConfigProvider: ValueProvider = {
  provide: OpenAPIConfigKey,
  useValue: {
    deviceControlUrl,
    deviceDIYScenesUrl,
    deviceLightScenesUrl,
    deviceListUrl,
    deviceStateUrl,
  },
};

// export const OpenAPIMqttConfigProvider: FactoryProvider = {
//   provide: OpenAPIMqttConfigKey,
//   inject: [MODULE_OPTIONS_TOKEN],
//   useFactory: (options: typeof OPTIONS_TYPE): OpenAPIMqttConfig => ({
//     host: mqttBrokerHost,
//     port: mqttBrokerPort,
//     protocol: mqttBrokerProtocol,
//     username: options.apiKey,
//     password: options.apiKey,
//   }),
// };
