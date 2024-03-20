/* eslint-disable func-names */
import { NestFactory } from '@nestjs/core';
import { UltimateGoveeModule } from './ultimate-govee.module';
import { UltimateGoveeService } from './ultimate-govee.service';
import {
  UltimateGoveeConfig,
  UltimateGoveeConfiguration,
} from './ultimate-govee.config';
import { CQRSLogger } from '~ultimate-govee-common';
import { UltimateGoveeModuleOptions } from 'index';

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
            enabled: config?.connections?.iot,
          },
          rest: {},
        },
      }),
    }),
    {
      logger: new CQRSLogger(),
    },
  );
  app.enableShutdownHooks();
  await app.listen(3000);
  const service = app.get(UltimateGoveeService);
  const config = app.get<UltimateGoveeConfig>(
    UltimateGoveeConfiguration.provide,
  );
  if (config?.username && config.password) {
    await service.connect(config.username, config.password);
  }
  // service.channel('ble').setEnabled(true);
  // service.channel('ble').setConfig({ devices: undefined });
  service.channel('iot').setEnabled(true);
}

bootstrap();
