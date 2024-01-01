/* eslint-disable class-methods-use-this */
import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { IoTConfigReceivedEvent } from '../events/iot/iot-config-received.event';
import { ConnectIoTCommand } from '../commands/iot/connect-iot.command';
import { IoTMessageEvent } from '../events/iot/iot-message.event';
import { ParseIoTMessageCommand } from '../commands/iot/parse-iot-message.command';

@Injectable()
export class IoTSagas {
  private readonly logger: Logger = new Logger(IoTSagas.name);

  @Saga()
  iotConfigurationReceived(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(IoTConfigReceivedEvent),
      map(
        (event) =>
          new ConnectIoTCommand(
            event.certificate,
            event.privateKey,
            event.endpoint,
            event.accountId,
            event.clientId,
            event.topic,
          ),
      ),
    );
  }

  @Saga()
  iotMessageReceived(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(IoTMessageEvent),
      map((event) => new ParseIoTMessageCommand(event.message)),
    );
  }
}
