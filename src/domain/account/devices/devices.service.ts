import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import {
  GoveeDevice,
  GoveeDeviceService,
  GoveeDeviceStatus,
  GoveeProductService,
  OAuthData,
} from '../../../data';
import { DeviceModel, createDevice } from './devices.model';
import { DevicesFactory } from './devices.factory';
import { DeviceType } from './types/device-type';

@Injectable()
export class DevicesService {
  private readonly logger: Logger = new Logger(DevicesService.name);
  private devices: Record<string, DeviceType> = {};
  public readonly onDeviceAdded: Subject<DeviceType> = new Subject();

  constructor(
    private readonly deviceApi: GoveeDeviceService,
    private readonly productApi: GoveeProductService,
    private readonly devicesFactory: DevicesFactory,
  ) {}

  async loadDevices(
    oauth: OAuthData,
    iotUpdater: (device: DeviceModel) => unknown,
  ) {
    this.logger.log('Loading product categories');
    const productCategories = await this.productApi.getProductCategories();
    this.logger.log('Loading devices');
    const deviceList = await this.deviceApi.getDeviceList(oauth);
    deviceList.forEach((apiDevice: GoveeDevice) => {
      if (this.devices[apiDevice.id] === undefined) {
        const newDevice = createDevice(
          apiDevice,
          productCategories,
          iotUpdater,
        );
        const newDeviceType = this.devicesFactory.create(newDevice);
        if (newDeviceType === undefined) {
          return;
        }
        this.devices[newDevice.id] = newDeviceType;
        newDevice.refresh();
      }
      this.devices[apiDevice.id].deviceStatus(apiDevice);
    });
  }

  onMessage(message: GoveeDeviceStatus) {
    if (this.devices === undefined) {
      this.logger.warn('No devices loaded', this.devices);
      return;
    }
    const device = this.devices[message.id];
    if (!device) {
      this.logger.warn(`Unknown device ${message.id}`);
      return;
    }
    device.deviceStatus(message);
    if (message.cmd !== 'status') {
      device.refresh();
    }
  }
}
