import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { BleClient, GoveeDeviceStatus, InjectBleOptions } from '@govee/data';
import { ChannelService } from '../channel.service';
import { BleChannelConfig, BleChannelState } from './ble-channel.state';
import { DeviceId, chunk, sleep } from '@govee/common';
import { Subject } from 'rxjs';
import { DeviceStatusReceivedEvent } from '@govee/domain/devices/cqrs';
import { Device } from '../../devices';
import { BleConfig } from '@govee/data/ble/ble.options';
import { ConfigType } from '@nestjs/config';

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
    this.state.serviceUUID = '000102030405060708090a0b0c0d1910';
    this.state.dataCharacteristic = '000102030405060708090a0b0c0d2b10';
    this.state.controlCharacteristic = '000102030405060708090a0b0c0d2b11';
    this.state.keepAlive = 'aa010000000000000000000000000000000000ab';
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
    priority: number,
  ) {
    const device = this.devices[id];
    if (!device) {
      this.logger.error(`Device ${id} not known`);
      return;
    }
    const serviceUuid = this.state?.serviceUUID;
    const notifyCharUuid = this.state?.dataCharacteristic;
    const writeCharUuid = this.state?.controlCharacteristic;
    if (!serviceUuid || !notifyCharUuid || !writeCharUuid) {
      this.logger.error(`Service or char not found`);
      return;
    }
    const response: Subject<number[][]> = new Subject();
    response.subscribe((status) => {
      const deviceStatus: GoveeDeviceStatus = {
        id,
        cmd: 'status',
        model: device.model,
        pactCode: device.pactCode,
        pactType: device.pactType,
        state: {},
        op: {
          command: status,
        },
      };
      this.eventBus.publish(new DeviceStatusReceivedEvent(deviceStatus));
    });
    this.bleClient.commandQueue.next({
      id: id,
      address: bleAddress,
      serviceUuid,
      dataUuid: notifyCharUuid,
      writeUuid: writeCharUuid,
      commands,
      response,
      priority,
    });
  }

  async onModuleInit() {
    await sleep(2000);
    this.bleClient.enabled.next(this.bleConfig.enabled);
  }
}
