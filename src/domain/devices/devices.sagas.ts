import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import {
  DeviceConfigReceivedEvent,
  DeviceStatusReceivedEvent,
} from './cqrs/events';
import {
  HandleDeviceConfigCommand,
  LinkDeviceProductCommand,
  UpdateDeviceStatusCommand,
} from './cqrs/commands';

@Injectable()
export class DevicesSagas {
  constructor() {}

  @Saga()
  deviceReceived = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(DeviceConfigReceivedEvent),
      map((event) =>
        event.product
          ? new HandleDeviceConfigCommand(event.deviceConfig, event.product)
          : new LinkDeviceProductCommand(event.deviceConfig),
      ),
    );

  @Saga()
  deviceStatusReceived = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(DeviceStatusReceivedEvent),
      map(
        (event) =>
          new UpdateDeviceStatusCommand(
            event.deviceStatus.id,
            event.deviceStatus,
          ),
      ),
    );
}
