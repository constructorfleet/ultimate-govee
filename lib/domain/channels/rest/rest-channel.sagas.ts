import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventBus, ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, auditTime, map, tap } from 'rxjs';
import {
  RefreshDeviceListEvent,
  RestChannelChangedEvent,
  RestChannelConfigReceivedEvent,
} from './events';
import { ConfigureRestChannelCommand } from './commands/configure-rest-channel.command';
import { RetrieveDeviceListCommand } from './commands/retrieve-device-list.command';

@Injectable()
export class RestChannelSagas implements OnModuleDestroy {
  private readonly logger: Logger = new Logger(RestChannelSagas.name);
  private refreshInterval: NodeJS.Timeout | undefined = undefined;

  constructor(private readonly eventBus: EventBus) {}

  onModuleDestroy() {
    if (this.refreshInterval !== undefined) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

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
      tap(() => {
        if (this.refreshInterval !== undefined) {
          this.refreshInterval = setInterval(
            () => this.eventBus.publish(new RefreshDeviceListEvent()),
            3 * 60 * 60 * 1000, // 3 hours
          );
        }
      }),
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
