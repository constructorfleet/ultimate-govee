import { Injectable, Logger } from '@nestjs/common';
import { EventBus, ICommand, Saga, ofType } from '@nestjs/cqrs';
import { arrayEquality } from '@santi100/equal-lib';
import { Observable, filter, groupBy, map, mergeMap, throttleTime } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { OpType, asOpCode, base64ToHex } from '~ultimate-govee-common';
import { DeviceDiscoveredEvent } from '../../devices/cqrs';
import { DeviceRefeshEvent } from '../../devices/cqrs/events/device-refresh.event';
import { DeviceStateCommandEvent } from '../../devices/cqrs/events/device-state-command.event';
import { BleChannelService } from './ble-channel.service';
import { BlePublishCommand, BleRecordDeviceCommand } from './commands';
import { ConfigureBleChannelCommand } from './commands/configure-ble-channel.command';
import {
  BleChannelChangedEvent,
  BleChannelConfigReceivedEvent,
} from './events';

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
      filter((event) => event.addresses.bleAddress !== undefined), // && event.addresses.iotTopic === undefined),
      map(
        (event) => {
            if (event.opIdentifiers === undefined) {
              return new DeviceRefeshEvent(event.deviceId, event.model, event.goodsType, event.addresses, [[0x01]]);
            }
            return event;
        }
      ),
      groupBy((event) => event.deviceId),
      mergeMap((eventGroup$) => eventGroup$.pipe(
        throttleTime(5000, undefined, {
          leading: true,
          trailing: false
        })
      )),
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
      filter(
        (event) =>
          event.addresses.bleAddress !== undefined &&
          event.command.command !== undefined &&
          (event.command.command === 'turn' || event.command.data.command !== undefined)
      ),
      map(
        (event) =>
          new BlePublishCommand(
            event.command.commandId,
            event.id,
            event.addresses.bleAddress!,
            event.command.command === 'turn' 
              ? [asOpCode(OpType.COMMAND, 0x01, event.command.data.value?.toString() === '1' ? 0x01 : 0x00)]
              : event.command.data.command!.map((value: number[] | string) => 
              typeof value === 'string' ? base64ToHex(value) : value
            ),
          ),
      ),
    );
}