/* eslint-disable func-names */
import { NestFactory } from '@nestjs/core';
import { UltimateGoveeModuleOptions } from 'index';
import {
  UltimateGoveeConfig,
  UltimateGoveeConfiguration,
} from './ultimate-govee.config';
import { UltimateGoveeModule } from './ultimate-govee.module';
import { UltimateGoveeService } from './ultimate-govee.service';

async function bootstrap() {
  const app = await NestFactory.create(
    UltimateGoveeModule.forRootAsync({
      useFactory: (
        config: UltimateGoveeConfig,
      ): typeof UltimateGoveeModuleOptions => ({
        persist: {
          rootDirectory: 'persisted',
        },
        auth: {},
        channels: {
          ble: {
            enabled: false, //config?.connections?.ble,
          },
          iot: {
            enabled: true, //config?.connections?.iot,
          },
          rest: {},
          openapi: {
            enabled: false, //config?.connections?.openApi,
          },
        },
      }),
    }),
    {
      logger: ['warn', 'error', 'log', 'verbose', 'debug'],
      snapshot: true,
    },
  );
  app.enableShutdownHooks();
  await app.listen(3000);
  const service = app.get(UltimateGoveeService);
  const config = app.get<UltimateGoveeConfig>(
    UltimateGoveeConfiguration.provide,
  );
  console.dir(config);
  if (config?.username && config?.password) {
    await service.connect(config.username, config.password);
  }
  // service.channel('ble').setEnabled(config.connections?.ble === true);
  // service.channel('iot').setEnabled(config.connections?.iot === true);
  // service.channel('openapi').setEnabled(config.connections?.openApi === true);
  // if (config?.apikey) {
  //   service.channel('openapi').setConfig({ apiKey: config.apikey });
  // }
}

bootstrap();
