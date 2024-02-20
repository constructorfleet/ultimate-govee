/* eslint-disable func-names */
import { NestFactory } from '@nestjs/core';
import { UltimateGoveeModule } from './ultimate-govee.module';
import { UltimateGoveeService } from './ultimate-govee.service';
import {
  UltimateGoveeConfig,
  UltimateGoveeConfiguration,
} from './ultimate-govee.config';

async function bootstrap() {
  const app = await NestFactory.create(
    UltimateGoveeModule.forRoot({
      channels: {
        ble: {
          enabled: true,
          deviceIds: undefined,
        },
        iot: {
          enabled: true,
        },
      },
    }),
  );
  app.enableShutdownHooks();
  await app.listen(3000);
  const service = app.get(UltimateGoveeService);
  const config = app.get<UltimateGoveeConfig>(
    UltimateGoveeConfiguration.provide,
  );
  // service.channel('ble').setEnabled(true);
  // service.channel('ble').setConfig({ devices: undefined });
  // service.channel('iot').setEnabled(true);
  await service.connect(config.username, config.password);
}

bootstrap();
