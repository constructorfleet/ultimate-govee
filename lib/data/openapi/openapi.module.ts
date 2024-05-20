import { DynamicModule, Module } from '@nestjs/common';
import { MqttModule } from '~ultimate-govee-common';
import { MODULE_OPTIONS_TOKEN } from '~ultimate-govee-persist';
import { MqttMessageHandler } from './openapi.models';
import {
  OpenAPIConfigProvider,
  // OpenAPIMqttConfigProvider,
} from './openapi.providers';
import { OpenAPIService } from './openapi.service';
import { ConfigurableModuleClass, OPTIONS_TYPE } from './openapi.types';
import {
  mqttBrokerHost,
  mqttBrokerPort,
  mqttBrokerProtocol,
  deviceControlUrl,
  deviceListUrl,
  deviceDIYScenesUrl,
  deviceLightScenesUrl,
} from './openapi.const';

@Module({})
export class OpenAPICoreModule {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      module: OpenAPICoreModule,
      providers: [
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
        // OpenAPIMqttConfigProvider,
        OpenAPIConfigProvider,
      ],
      exports: [
        // OpenAPIMqttConfigProvider.provide,
        OpenAPIConfigProvider.provide,
      ],
    };
  }
}

@Module({
  imports: [
    MqttModule.forFeatureAsync({
      useFactory: () => {
        return {
          _kind: 'individual',
          brokerHost: mqttBrokerHost,
          brokerPort: mqttBrokerPort,
          protocol: mqttBrokerProtocol,
          deserializeMessage: OpenAPIService.deserializeMqttMessage,
          deviceControlUrl,
          deviceListUrl,
          deviceDIYScenesUrl,
          deviceLightScenesUrl,
        };
      },
    }),
  ],
  providers: [
    // OpenAPIMqttConfigProvider,
    OpenAPIConfigProvider,
    OpenAPIService,
  ],
  exports: [
    // OpenAPIMqttConfigProvider,
    OpenAPIConfigProvider,
    OpenAPIService,
    MqttModule,
  ],
})
export class OpenAPIModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const coreModule = OpenAPICoreModule.forRoot(options);
    const mqttModule = MqttModule.forFeature({
      _kind: 'combined',
      brokerUrl: 'mqtts://mqtt.openapi.govee.com',
      // username: options.apiKey,
      // password: options.apiKey,
      // clientId: options.apiKey,
      deserializeMessage: MqttMessageHandler.deserializeMessage,
    });
    const module = super.forRoot(options);
    module.imports = [...(module.imports ?? []), coreModule, mqttModule];
    module.exports = [...(module.exports ?? []), OpenAPIService, mqttModule];
    return module;
  }
}
