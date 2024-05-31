/* eslint-disable func-names */
import { NestFactory } from '@nestjs/core';
import { UltimateGoveeModuleOptions } from 'index';
import {
  UltimateGoveeConfig,
  UltimateGoveeConfiguration,
} from './ultimate-govee.config';
import { UltimateGoveeModule } from './ultimate-govee.module';
import { UltimateGoveeService } from './ultimate-govee.service';
import { ConfigModule, ConfigType, registerAs } from '@nestjs/config';

const goveeConfig = registerAs('Dev.Govee.Config', () => ({
  enableBle: true,
  enableIoT: true,
  enableOpenAPI: false,
  persistDirectory: 'persisted',
}));

async function bootstrap() {
  const app = await NestFactory.create(
    UltimateGoveeModule.forRootAsync({
      imports: [ConfigModule.forFeature(goveeConfig)],
      useFactory: (
        config: ConfigType<typeof goveeConfig>,
      ): typeof UltimateGoveeModuleOptions => ({
        persist: {
          rootDirectory: config.persistDirectory,
        },
        auth: {},
        channels: {
          ble: {
            enabled: config.enableBle,
          },
          iot: {
            enabled: config.enableIoT,
          },
          rest: {},
          openapi: {
            enabled: config.enableOpenAPI,
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
