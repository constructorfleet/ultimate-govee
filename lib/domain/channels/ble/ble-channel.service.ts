import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  BleClient,
  DecodedDevice,
} from '@constructorfleet/ultimate-govee/data';
import { ChannelService } from '../channel.service';
import { BleChannelConfig } from './ble-channel.state';
import { DeviceId, chunk } from '@constructorfleet/ultimate-govee/common';
import { Subject, combineLatest, map } from 'rxjs';
import { DeviceStatusReceivedEvent } from '@constructorfleet/ultimate-govee/domain/devices/cqrs';
import { Device } from '../../devices/device';
import { BleChannelChangedEvent } from './events';

@Injectable()
export class BleChannelService extends ChannelService<BleChannelConfig, true> {
  readonly togglable: true = true as const;
  readonly name: 'ble' = 'ble' as const;

  private readonly devices: Record<string, Device> = {};
  private readonly peripherals: Record<string, DecodedDevice> = {};

  constructor(
    private readonly bleClient: BleClient,
    eventBus: EventBus,
  ) {
    super(eventBus);
    combineLatest([this.onConfigChanged$, this.onEnabledChanged$])
      .pipe(
        map(([config, enabled]) => new BleChannelChangedEvent(enabled, config)),
      )
      .subscribe((event) => this.eventBus.publish(event));

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
        state: peripheral.state,
      });
      this.logger.debug('Peripheral decoded');
      this.eventBus.publish(event);
    });
  }

  private allowedDevice(device: Device): boolean {
    return this.getConfig()?.devices?.includes(device.id) ?? true;
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
    id: DeviceId,
    bleAddress: string,
    commands: number[][],
    results$: Subject<number[]>,
  ) {
    const device = this.devices[id];
    if (!device) {
      this.logger.error(`Device ${id} not known`);
      return results$.complete();
    }

    this.bleClient.commandQueue.next({
      id: id,
      address: bleAddress,
      commands,
      results$,
    });
  }
}
