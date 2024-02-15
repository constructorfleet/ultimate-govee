import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, catchError, map, of, takeUntil } from 'rxjs';
import {
  DeviceConfigReceivedEvent,
  DeviceStatusReceivedEvent,
} from './cqrs/events';
import {
  HandleDeviceConfigCommand,
  LinkDeviceProductCommand,
  UpdateDeviceStatusCommand,
} from './cqrs/commands';
import { ModuleDestroyObservable } from '@govee/common';

@Injectable()
export class DevicesSagas {
  private readonly logger: Logger = new Logger(DevicesSagas.name);
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  @Saga()
  deviceReceived = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      takeUntil(this.moduleDestroyed$),
      ofType(DeviceConfigReceivedEvent),
      map((event) =>
        event.product
          ? new HandleDeviceConfigCommand(event.deviceConfig, event.product)
          : new LinkDeviceProductCommand(event.deviceConfig),
      ),
      catchError((err, caught) => {
        this.logger.error('DeviceReceivedEvent', err, caught);
        return of();
      }),
    );

  @Saga()
  deviceStatusReceived = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      takeUntil(this.moduleDestroyed$),
      ofType(DeviceStatusReceivedEvent),
      map(
        (event) =>
          new UpdateDeviceStatusCommand(
            event.deviceStatus.id,
            event.deviceStatus,
          ),
      ),
      catchError((err, caught) => {
        this.logger.error('DeviceStatusReceivedEvent', err, caught);
        return of();
      }),
    );
}
