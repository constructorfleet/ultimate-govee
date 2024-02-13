import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, catchError, filter, map, mergeMap, of } from 'rxjs';
import {
  BleChannelChangedEvent,
  BleChannelConfigReceivedEvent,
} from './events';
import { ConfigureBleChannelCommand } from './commands/configure-ble-channel.command';
import { DeviceDiscoveredEvent } from '@govee/domain/devices/cqrs';
import { BleChannelService } from './ble-channel.service';
import * as CQRS from '@govee/domain/devices/cqrs';
import { BlePublishCommand, BleRecordDeviceCommand } from './commands';
import { asOpCode, base64ToHex } from '@govee/common';

@Injectable()
export class BleChannelSagas {
  private readonly logger: Logger = new Logger(BleChannelSagas.name);

  constructor(private readonly service: BleChannelService) {}

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

  @Saga()
  configurationChangedFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(BleChannelChangedEvent),
      map((event) => new ConfigureBleChannelCommand(event.config)),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );

  @Saga()
  deviceDiscoveredFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(DeviceDiscoveredEvent),
      map((event) => new BleRecordDeviceCommand(event.device)),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );

  @Saga()
  refreshDeviceFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(CQRS.DeviceRefeshEvent),
      filter((event) => event.addresses.bleAddress !== undefined),
      filter(
        (event) =>
          event.opIdentifiers !== undefined && event.opIdentifiers.length > 0,
      ),
      map(
        (event) =>
          new BlePublishCommand(
            event.deviceId,
            event.addresses.bleAddress!,
            event.opIdentifiers!.map((op) => asOpCode(0xaa, ...op)),
          ),
      ),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );

  @Saga()
  publishBleCommand = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(CQRS.DeviceStateCommandEvent),
      filter((event) => event.addresses.bleAddress !== undefined),
      filter(
        (event) =>
          event.command.command === undefined ||
          event.command.command === 'ptReal',
      ),
      filter((event) => event.command.data.command !== undefined),
      map(
        (event) =>
          new BlePublishCommand(
            event.id,
            event.addresses.bleAddress!,
            event.command.data.command!.map((value: number[] | string) =>
              typeof value === 'string' ? base64ToHex(value) : value,
            ),
          ),
      ),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );
}
