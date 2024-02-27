import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, auditTime, map } from 'rxjs';
import {
  RefreshDeviceListEvent,
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
    );

  @Saga()
  configurationChangedFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(RestChannelChangedEvent),
      map(() => new RetrieveDeviceListCommand()),
    );

  @Saga()
  refreshDeviceList = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(RefreshDeviceListEvent),
      auditTime(30000),
      map(() => new RetrieveDeviceListCommand()),
    );
}
