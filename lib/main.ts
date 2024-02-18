/* eslint-disable func-names */
import { NestFactory } from '@nestjs/core';
import { UltimateGoveeModule } from './ultimate-govee.module';
import { UltimateGoveeService } from './ultimate-govee.service';

async function bootstrap() {
  const app = await NestFactory.create(UltimateGoveeModule);
  app.enableShutdownHooks();
  await app.listen(3000);
}

bootstrap();
