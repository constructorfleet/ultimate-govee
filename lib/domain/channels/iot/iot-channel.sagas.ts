import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType, EventBus } from '@nestjs/cqrs';
import {
  Observable,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  of,
} from 'rxjs';
import * as CQRS from '@constructorfleet/ultimate-govee/domain/devices/cqrs';
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
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IoTChannelSagas {
  private readonly logger: Logger = new Logger(IoTChannelSagas.name);
  constructor(
    private readonly service: IoTChannelService,
    private readonly eventBus: EventBus,
  ) {}

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
      filter((event) => event.addresses.iotTopic !== undefined),
      map(
        (event) =>
          new IoTPublishCommand(uuidv4(), event.addresses.iotTopic!, {
            topic: event.addresses.iotTopic,
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

  @Saga()
  publishIoTCommand = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(CQRS.DeviceStateCommandEvent),
      filter((event) => event.addresses.iotTopic !== undefined),
      map(
        (event) =>
          new IoTPublishCommand(
            event.command.commandId,
            event.addresses.iotTopic!,
            {
              topic: event.addresses.iotTopic,
              msg: {
                accountTopic: this.service.getConfig()?.topic,
                cmd: event.command.command ?? 'ptReal',
                cmdVersion: event.command.cmdVersion ?? 0,
                data: event.command.data,
                transaction: `u_${Date.now()}`,
                type: event.command.type ?? 1,
              },
            },
          ),
      ),
      // tap((command) =>
      //   this.eventBus.publish(new CQRS.CommandExpiredEvent(command.commandId)),
      // ),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );
}
