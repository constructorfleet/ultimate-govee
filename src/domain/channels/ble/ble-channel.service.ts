import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { BleClient } from '@govee/data';
import { ChannelService } from '../channel.service';
import { BleChannelConfig, BleChannelState } from './ble-channel.state';
import { DeviceId, chunk, sleep } from '@govee/common';
import { Subject } from 'rxjs';
import { DeviceStatusReceivedEvent } from '@govee/domain/devices/cqrs';
import { Device } from '../../devices';
import { BleConfig } from '@govee/data/ble/ble.options';
import { ConfigType } from '@nestjs/config';

const serviceUUID = '000102030405060708090a0b0c0d1910';
const dataCharUUID = '000102030405060708090a0b0c0d2b10';
const controlCharUUID = '000102030405060708090a0b0c0d2b11';

@Injectable()
export class BleChannelService
  extends ChannelService<BleChannelConfig, BleChannelState>
  implements OnModuleInit
{
  private readonly logger: Logger = new Logger();
  private readonly devices: Record<DeviceId, Device> = {};

  constructor(
    private readonly bleClient: BleClient,
    @Inject(BleConfig.KEY)
    private readonly bleConfig: ConfigType<typeof BleConfig>,
    eventBus: EventBus,
  ) {
    super(eventBus);
    this.state.peripherals = {};
    bleClient.peripheralDecoded.subscribe((peripheral) => {
      const device = this.devices[this.toDeviceId(peripheral.id)];
      if (!device) {
        return;
      }
      this.logger.debug('Peripheral decoded');
      this.state.peripherals[peripheral.id] = peripheral;
      const event = new DeviceStatusReceivedEvent({
        id: device.id,
        model: device.model,
        pactCode: device.pactCode,
        pactType: device.pactType,
        state: peripheral.state,
      });
      this.eventBus.publish(event);
    });
  }

  toPeripheralId(deviceId: DeviceId): string {
    return deviceId.replace(/:/g, '').toLowerCase();
  }

  toDeviceId(peripheralId: string): string {
    return chunk(peripheralId.toUpperCase().split(''), 2).join(':');
  }

  setEnabled(enabled: boolean) {
    this.bleClient.enabled.next(enabled);
  }

  onConfigChange(config: BleChannelConfig) {
    this.bleClient.enabled.next(config.enabled);
  }

  recordDevice(device: Device) {
    this.devices[device.id] = device;
  }

  isPeripheralKnown(deviceId: DeviceId): boolean {
    return this.state.peripherals[this.toPeripheralId(deviceId)] !== undefined;
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
      serviceUuid: serviceUUID,
      dataUuid: dataCharUUID,
      writeUuid: controlCharUUID,
      commands,
      results$,
    });
  }

  async onModuleInit() {
    await sleep(2000);
    this.bleClient.enabled.next(this.bleConfig.enabled);
  }
}
