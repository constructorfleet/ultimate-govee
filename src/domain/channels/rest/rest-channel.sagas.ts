import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, auditTime, catchError, map, of, takeUntil } from 'rxjs';
import {
  RefreshDeviceListEvent,
  RestChannelChangedEvent,
  RestChannelConfigReceivedEvent,
} from './events';
import { ConfigureRestChannelCommand } from './commands/configure-rest-channel.command';
import { RetrieveDeviceListCommand } from './commands/retrieve-device-list.command';
import { ModuleDestroyObservable } from '@govee/common';

@Injectable()
export class RestChannelSagas {
  private readonly logger: Logger = new Logger(RestChannelSagas.name);

  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  @Saga()
  configureRestChannelFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      takeUntil(this.moduleDestroyed$),
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
      takeUntil(this.moduleDestroyed$),
      ofType(RestChannelChangedEvent),
      map(() => new RetrieveDeviceListCommand()),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );

  @Saga()
  refreshDeviceList = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      takeUntil(this.moduleDestroyed$),
      ofType(RefreshDeviceListEvent),
      auditTime(30000),
      map(() => new RetrieveDeviceListCommand()),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );
}
