import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, catchError, map, of } from 'rxjs';
import {
  RestChannelChangedEvent,
  RestChannelConfigReceivedEvent,
} from './events';
import { ConfigureRestChannelCommand } from './commands/configure-rest-channel.command';
import { RetrieveDeviceListCommand } from './commands/retrieve-device-list.command';

@Injectable()
export class RestChannelSagas {
  private readonly logger: Logger = new Logger(RestChannelSagas.name);

  @Saga()
  configureRestChannelFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(RestChannelConfigReceivedEvent),
      map((event) => new ConfigureRestChannelCommand(event.config)),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );

  @Saga()
  configurationChangedFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(RestChannelChangedEvent),
      map(() => new RetrieveDeviceListCommand()),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );
}
