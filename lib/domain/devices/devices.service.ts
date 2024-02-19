import { Injectable, Logger } from '@nestjs/common';
import { EventBus, QueryBus } from '@nestjs/cqrs';
import { DeltaMap, DeviceId, Optional } from '~ultimate-govee-common';
import { map } from 'rxjs';
import { Device } from './device';
import { DeviceDiscoveredEvent, DeviceUpdatedEvent } from './cqrs/events';
import { ModelProductQuery } from '../channels/rest/queries/model-product.query';
import { GoveeDevice, Product } from '~ultimate-govee-data';
import { ClassConstructor } from 'class-transformer';
import { BLEDevice, DeviceModel, IoTDevice, WiFiDevice } from './devices.model';
import { Version } from './version.info';
import { DevicesFactory } from './devices.factory';

@Injectable()
export class DevicesService {
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
    let device = this.getDevice(goveeDevice.id);
    if (device === undefined) {
      const deviceModel = await this.createDeviceModel(goveeDevice);
      device = this.setDevice(this.factory.create(deviceModel));
      this.eventBus.publish(new DeviceDiscoveredEvent(device));
    }
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
