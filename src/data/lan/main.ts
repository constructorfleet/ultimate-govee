import { NestFactory } from '@nestjs/core';
import { LANModule } from './lan.module';
import { IpcClient, IpcServer } from '../../ipc';
import { LANDiscovery } from './lan.service';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(LANModule);
  const service = app.get(LANDiscovery);
  // const client = app.get(IpcClient);
  // await client.connect()
  app.enableShutdownHooks();
  await app.startAllMicroservices();
  try {
    await app.init();
    await service.discoverDevices();
  } catch (err) {
    console.dir(err);
  }
}

bootstrap();
