import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, catchError, map, of } from 'rxjs';
import { BleChannelConfigReceivedEvent } from './events';
import { ConfigureBleChannelCommand } from './commands/configure-ble-channel.command';

@Injectable()
export class RestChannelSagas {
  private readonly logger: Logger = new Logger(RestChannelSagas.name);

  @Saga()
  configureBleChannelFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(BleChannelConfigReceivedEvent),
      map((event) => new ConfigureBleChannelCommand(event.config)),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );

  // @Saga()
  // configurationChangedFlow = (events$: Observable<any>): Observable<ICommand> =>
  //   events$.pipe(
  //     ofType(BleChannelChangedEvent),
  //     map(() => new RetrieveDeviceListCommand()),
  //     catchError((err, caught) => {
  //       this.logger.error(err, caught);
  //       return of();
  //     }),
  //   );

  // @Saga()
  // refreshDeviceFlow = (events$: Observable<any>): Observable<ICommand> =>
  //   events$.pipe(
  //     ofType(CQRS.DeviceRefeshEvent),
  //     filter((event) => event.iotTopic !== undefined),
  //     map(
  //       (event) =>
  //         new IoTPublishCommand(event.iotTopic!, {
  //           topic: event.iotTopic,
  //           msg: {
  //             accountTopic: this.service.getConfig()?.topic,
  //             cmd: 'status',
  //             cmdVersion: 0,
  //             transaction: `u_${Date.now()}`,
  //             type: 0,
  //           },
  //         }),
  //     ),
  //     catchError((err, caught) => {
  //       this.logger.error(err, caught);
  //       return of();
  //     }),
  //   );
}
