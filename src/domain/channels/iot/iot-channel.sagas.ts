import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import {
  Observable,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  of,
} from 'rxjs';
import * as CQRS from '@govee/domain/devices/cqrs';
import {
  IoTChannelChangedEvent,
  IoTChannelConfigReceivedEvent,
} from './events';
import {
  ConfigureIoTChannelCommand,
  ConnectToIoTCommand,
  IoTPublishCommand,
} from './commands';
import { IoTChannelService } from './iot-channel.service';

@Injectable()
export class IoTChannelSagas {
  private readonly logger: Logger = new Logger(IoTChannelSagas.name);
  constructor(private readonly service: IoTChannelService) {}

  @Saga()
  configureIotChannelFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(IoTChannelConfigReceivedEvent),
      map((event) => new ConfigureIoTChannelCommand(event.config)),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );

  @Saga()
  connectIoTClientFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(IoTChannelChangedEvent),
      distinctUntilChanged((previous, current) => current.equals(previous)),
      map(
        (event) =>
          new ConnectToIoTCommand(
            event.iotData,
            event.callback,
            event.iotData.topic,
          ),
      ),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );

  @Saga()
  refreshDeviceFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(CQRS.DeviceRefeshEvent),
      filter((event) => event.device.iotTopic !== undefined),
      map(
        (event) =>
          new IoTPublishCommand(event.device.iotTopic!, {
            topic: event.device.iotTopic,
            msg: {
              accountTopic: this.service.getConfig()?.topic,
              cmd: 'status',
              cmdVersion: 0,
              transaction: `u_${Date.now()}`,
              type: 0,
            },
          }),
      ),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );
}
