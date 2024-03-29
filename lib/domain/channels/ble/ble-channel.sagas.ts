import { Injectable, Logger } from '@nestjs/common';
import { EventBus, ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, filter, map } from 'rxjs';
import { arrayEquality } from '@santi100/equal-lib';
import {
  BleChannelChangedEvent,
  BleChannelConfigReceivedEvent,
} from './events';
import { ConfigureBleChannelCommand } from './commands/configure-ble-channel.command';
import { DeviceDiscoveredEvent } from '../../devices/cqrs';
import { BleChannelService } from './ble-channel.service';
import { BlePublishCommand, BleRecordDeviceCommand } from './commands';
import { asOpCode, base64ToHex } from '~ultimate-govee-common';
import { v4 as uuidv4 } from 'uuid';
import { DeviceRefeshEvent } from '../../devices/cqrs/events/device-refresh.event';
import { DeviceStateCommandEvent } from '../../devices/cqrs/events/device-state-command.event';

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
      map((event) => new ConfigureBleChannelCommand(false, event.config)),
    );

  @Saga()
  configurationChangedFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(BleChannelChangedEvent),
      map(
        (event) => new ConfigureBleChannelCommand(event.enabled, event.config),
      ),
    );

  @Saga()
  deviceDiscoveredFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(DeviceDiscoveredEvent),
      map((event) => new BleRecordDeviceCommand(event.device)),
    );

  @Saga()
  refreshDeviceFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(DeviceRefeshEvent),
      filter((event) => event.addresses.bleAddress !== undefined && event.addresses.iotTopic === undefined),
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
            event
              .opIdentifiers!.filter(
                (identifiers, index, arr) =>
                  index === 0 ||
                  arr
                    .slice(0, index - 1)
                    .find((i) => arrayEquality(i, identifiers)) === undefined,
              )
              .map((op) => asOpCode(0xaa, ...op)),
          ),
      ),
    );

  @Saga()
  publishBleCommand = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(DeviceStateCommandEvent),
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
    );
}
