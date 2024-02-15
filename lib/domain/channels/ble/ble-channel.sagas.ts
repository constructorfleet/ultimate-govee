import { Injectable, Logger } from '@nestjs/common';
import { EventBus, ICommand, Saga, ofType } from '@nestjs/cqrs';
import {
  Observable,
  catchError,
  filter,
  map,
  mergeMap,
  of,
  sampleTime,
  tap,
} from 'rxjs';
import {
  BleChannelChangedEvent,
  BleChannelConfigReceivedEvent,
} from './events';
import { ConfigureBleChannelCommand } from './commands/configure-ble-channel.command';
import { DeviceDiscoveredEvent } from '@constructorfleet/ultimate-govee/domain/devices/cqrs';
import { BleChannelService } from './ble-channel.service';
import * as CQRS from '@constructorfleet/ultimate-govee/domain/devices/cqrs';
import { BlePublishCommand, BleRecordDeviceCommand } from './commands';
import { asOpCode, base64ToHex } from '@constructorfleet/ultimate-govee/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BleChannelSagas {
  private readonly logger: Logger = new Logger(BleChannelSagas.name);

  constructor(
    private readonly service: BleChannelService,
    private readonly eventBus: EventBus,
  ) {}

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
      sampleTime(1000),
      filter((event) => event.addresses.bleAddress !== undefined),
      filter(
        (event) =>
          event.opIdentifiers !== undefined && event.opIdentifiers.length > 0,
      ),
      map(
        (event) =>
          new BlePublishCommand(
            uuidv4(),
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
            event.command.commandId,
            event.id,
            event.addresses.bleAddress!,
            event.command.data.command!.map((value: number[] | string) =>
              typeof value === 'string' ? base64ToHex(value) : value,
            ),
          ),
      ),
      tap((command) =>
        this.eventBus.publish(new CQRS.CommandExpiredEvent(command.commandId)),
      ),
      catchError((err, caught) => {
        this.logger.error(err, caught);
        return of();
      }),
    );
}
