/* eslint-disable func-names */
import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
// import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { CredentialsConfig } from './config/govee.config';
import { CQRSLogger } from './common/cqrs-logger';
import { MicroserviceOptions } from '@nestjs/microservices';
import { IpcServer } from './ipc';
// import { Labelled } from './common';

// const getMesage = (event: Labelled, action: string): string => {
//   if (typeof event.label === 'string') {
//     return `${action} ${event.label}`;
//   }
//   return `${action} ${event.label()}`;
// };
// const logLabelled = (action: string, event: any) => {
//   try {
//     if (event.label) {
//       const logger = new CQRSLogger(EventBus.name);
//       const message = getMesage(event, action);
//       logger.debug(message);
//     }
//   } catch (e) {
//     // no-op
//   }
// };
// const eventBusPublish = EventBus.prototype.publish;
// const eventBusPublishAll = EventBus.prototype.publishAll;
// EventBus.prototype.publish = function (event, callback) {
//   logLabelled('Publishing', event);
//   return eventBusPublish.apply(this, [event, callback]);
// };
// EventBus.prototype.publishAll = function (events, context) {
//   events.forEach((event) => logLabelled('Publishing', event));
//   return eventBusPublishAll.apply(this, [events, context]);
// };

// const queryBusExecute = QueryBus.prototype.execute;
// QueryBus.prototype.execute = async function <T, TResult = any>(
//   query: T,
// ): Promise<TResult> {
//   logLabelled('Querying', query);
//   return queryBusExecute.apply(this, [query]) as TResult;
// };

// const commandBusExecute = CommandBus.prototype.execute;
// CommandBus.prototype.execute = async function <T, R>(command: T) {
//   logLabelled('Publishing', command);
//   return commandBusExecute.apply(this, [command]) as R;
// };

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    strategy: app.get(IpcServer),
  });
  const config = app.get<ConfigType<typeof CredentialsConfig>>(
    CredentialsConfig.KEY,
  );
  app.useLogger(
    new CQRSLogger('', {
      logLevels: ['error', 'fatal', 'log', 'verbose', 'warn'],
    }),
  );
  const appService = app.get(AppService);
  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(3000);
  appService.connect(config.username, config.password);
}

bootstrap();
