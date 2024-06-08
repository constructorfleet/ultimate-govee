import { Injectable, Logger } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { ClassConstructor } from 'class-transformer';
import { map } from 'rxjs';
import { DeltaMap, DeviceId, Optional } from '~ultimate-govee-common';
import { GoveeDevice, Product } from '~ultimate-govee-data';
import { ModelProductQuery } from '../channels/rest/queries/model-product.query';
import {
  DeviceDiscoveredEvent,
  DeviceStatusReceivedEvent,
  DeviceUpdatedEvent,
} from './cqrs/events';
import { Device } from './device';
import { DevicesFactory } from './devices.factory';
import { BLEDevice, DeviceModel, IoTDevice, WiFiDevice } from './devices.model';
import { Version } from './version.info';

@Injectable()
@EventsHandler(DeviceStatusReceivedEvent)
export class DevicesService
  implements IEventHandler<DeviceStatusReceivedEvent>
{
  private readonly logger: Logger = new Logger(DevicesService.name);

  private readonly deviceMap: DeltaMap<DeviceId, Device> = new DeltaMap({
    isModified: (current: Device, previous: Device) =>
      current.name !== previous.name,
  });

  constructor(
    private readonly factory: DevicesFactory,
    private readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
  ) {
    this.deviceMap.delta$
      .pipe(
        map((delta) => [
          ...Array.from(delta.modified.values()).map(
            (device) => new DeviceUpdatedEvent(device),
          ),
        ]),
      )
      .subscribe((events) => this.eventBus.publishAll(events));
  }

  handle(event: DeviceStatusReceivedEvent) {
    this.logger.debug('Received event', event);
    const device = this.getDevice(event.deviceStatus.id);
    if (!device) {
      this.logger.error(`Unknown device id ${event.deviceStatus.id}`);
      return;
    }
    device.deviceStatus(event.deviceStatus);
  }

  getByModel(model: string) {
    return Array.from(this.deviceMap.values()).filter(
      (device) => device.model === model,
    );
  }

  getDevice(deviceId: DeviceId) {
    return this.deviceMap.get(deviceId);
  }

  getDeviceIds(): string[] {
    return Array.from(this.deviceMap.keys());
  }

  setDevice(device: Device) {
    const existingDevice = this.getDevice(device.id);
    if (existingDevice !== undefined) {
      return existingDevice;
    }
    this.deviceMap.set(device.id, device);
    return device;
  }

  async discoverDevice(goveeDevice: GoveeDevice): Promise<Device> {
    const device = this.getDevice(goveeDevice.id);
    if (device === undefined) {
      const deviceModel = await this.createDeviceModel(goveeDevice);
      return this.createDeviceFromModel(deviceModel);
    }
    return device;
  }

  createDeviceFromModel(deviceModel: DeviceModel): Device {
    let device = this.getDevice(deviceModel.id);
    if (device !== undefined) {
      return device;
    }
    device = this.setDevice(this.factory.create(deviceModel));
    this.eventBus.publish(new DeviceDiscoveredEvent(device));
    return device;
  }

  async getProduct(device: GoveeDevice): Promise<Optional<Product>> {
    const product = await this.queryBus.execute(new ModelProductQuery(device));

    return product;
  }

  async createDeviceModel(
    device: GoveeDevice,
    product?: Product,
  ): Promise<DeviceModel> {
    product = product ?? (await this.getProduct(device));
    let constructor: ClassConstructor<DeviceModel> = DeviceModel;
    if (device.blueTooth) {
      constructor = BLEDevice(constructor);
    }
    if (device.wifi) {
      constructor = WiFiDevice(constructor);
    }
    if (device.iotTopic) {
      new Logger('createDevice').debug(device.iotTopic);
      constructor = IoTDevice(constructor);
    }
    const newDevice = new constructor({
      ...device,
      version: new Version(device.hardwareVersion, device.softwareVersion),
      category: product?.category || 'unknown',
      categoryGroup: product?.group || 'unknown',
      modelName: product?.modelName || 'unknown',
    });

    return newDevice;
  }
}
