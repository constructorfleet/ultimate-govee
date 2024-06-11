import { Injectable } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Subject, combineLatest } from 'rxjs';
import { DeviceId, chunk } from '~ultimate-govee-common';
import { BleClient, DecodedDevice } from '~ultimate-govee-data';
import { CommandExpiredEvent, DeviceStatusReceivedEvent } from '../../devices/cqrs';
import { Device } from '../../devices/device';
import { DeviceStatesType } from '../../devices/devices.types';
import { ChannelService } from '../channel.service';
import { InjectDeviceIds, InjectEnabled } from './ble-channel.providers';
import { BleChannelConfig } from './ble-channel.types';

@Injectable()
@EventsHandler(CommandExpiredEvent)
export class BleChannelService
  extends ChannelService<BleChannelConfig, true>
  implements  IEventHandler<CommandExpiredEvent>
{
  readonly togglable: true = true as const;
  readonly name: 'ble' = 'ble' as const;

  private readonly devices: Record<string, Device<DeviceStatesType>> = {};
  private readonly peripherals: Record<string, DecodedDevice> = {};

  constructor(
    private readonly bleClient: BleClient,
    eventBus: EventBus,
    @InjectEnabled enabled?: boolean,
    @InjectDeviceIds deviceIds?: string[],
  ) {
    super(eventBus, enabled, { devices: deviceIds });
    this.subscriptions.push(combineLatest([this.onConfigChanged$, this.onEnabledChanged$])
      .subscribe(() => {
        this.bleClient.enabled.next(this.isEnabled);
      }),

      bleClient.peripheralDecoded.subscribe((peripheral) => {
        const device = this.devices[peripheral.address];
        if (!device) {
          return;
        }
        this.peripherals[peripheral.id] = peripheral;
        const event = new DeviceStatusReceivedEvent({
          id: device.id,
          model: device.model,
          pactCode: device.pactCode,
          pactType: device.pactType,
          cmd: 'status',
          state: peripheral.state,
        });
        this.eventBus.publish(event);
      })
    );
    this.bleClient.enabled.next(this.isEnabled);
  }

  private allowedDevice(device: Device): boolean {
    return this.getConfig()?.devices?.includes(device.id) ?? true;
  }

  handle(event: CommandExpiredEvent) {
    this.bleClient.cancelCommand(event.commandId);
  }

  toPeripheralId(deviceId: DeviceId): string {
    return deviceId.replace(/:/g, '').toLowerCase();
  }

  toDeviceId(peripheralId: string): string {
    return chunk(peripheralId.toUpperCase().split(''), 2).join(':');
  }

  recordDevice(device: Device) {
    if (!this.allowedDevice || device.bleAddress === undefined) {
      return;
    }
    this.devices[device.bleAddress] = device;
  }

  isPeripheralKnown(deviceId: DeviceId): boolean {
    return this.peripherals[this.toPeripheralId(deviceId)] !== undefined;
  }

  sendCommand(
    commandId: string,
    id: DeviceId,
    bleAddress: string,
    commands: number[][],
    results$: Subject<number[]>,
  ) {
    if (!this.isEnabled) {
      return;
    }
    const device = this.devices[bleAddress];
    if (!device) {
      this.logger.error(`Device ${id} not known`);
      return results$.complete();
    }
    this.bleClient.commandQueue.next({
      commandId,
      id: id,
      address: bleAddress,
      commands,
      results$,
    });
  }
}