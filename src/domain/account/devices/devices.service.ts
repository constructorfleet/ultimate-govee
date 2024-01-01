import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import {
  GoveeDeviceService,
  GoveeDeviceStatus,
  GoveeProductService,
} from '../../../data';
import { OAuthData } from '../../models/account-client';
import { DeviceModel, createDevice } from './devices.model';
import { DevicesFactory } from './devices.factory';

@Injectable()
export class DevicesService {
  private readonly logger: Logger = new Logger(DevicesService.name);
  private readonly devices: Record<string, DeviceModel> = {};
  private readonly onDeviceAdded: Subject<DeviceModel> = new Subject();

  constructor(
    private readonly deviceApi: GoveeDeviceService,
    private readonly productApi: GoveeProductService,
    private readonly devicesFactory: DevicesFactory,
  ) {
    this.onDeviceAdded.subscribe((device: DeviceModel) =>
      this.devicesFactory.create(device),
    );
  }

  async loadDevices(oauth: OAuthData) {
    const productCategories = await this.productApi.getProductCategories();
    const deviceList = await this.deviceApi.getDeviceList(oauth);
    deviceList.forEach((apiDevice) => {
      if (this.devices[apiDevice.id] === undefined) {
        const newDevice = createDevice(apiDevice, productCategories);
        this.onDeviceAdded.next(newDevice);
        this.devices[newDevice.id] = newDevice;
      }
    });
  }

  onMessage(message: GoveeDeviceStatus) {
    this.logger.error(message);
    const device = this.devices[message.id];
    if (!device) {
      return;
    }
    device.status.next(message);
  }
}
