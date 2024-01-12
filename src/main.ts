import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose', 'fatal']);
  await app.listen(3000);
  await app.get<AppService>(AppService).connect();
}
bootstrap();
