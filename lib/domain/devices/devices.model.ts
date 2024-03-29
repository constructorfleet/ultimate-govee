import { ClassConstructor } from 'class-transformer';
import { BehaviorSubject } from 'rxjs';
import { Logger } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import { GoveeDevice, GoveeDeviceStatus, Product } from '~ultimate-govee-data';
import { Version } from './version.info';

export class ProductModel {
  constructor(
    public readonly category: string,
    public readonly group: string,
    public readonly modelName: string,
    public readonly ic: number,
    public readonly goodsType: number,
  ) {}
}

export type DeviceConstructorArgs = {
  id: string;
  name: string;
  model: string;
  iotTopic?: Optional<string>;
  modelName: string;
  ic: number;
  goodsType: number;
  pactCode: number;
  pactType: number;
  category: string;
  categoryGroup: string;
  version: Version;
  // deviceUpdate: <T>(device: T) => Promise<void>;
} & GoveeDeviceStatus;

export class DeviceModel {
  public readonly id: string;
  public readonly name: string;
  public readonly model: string;
  public readonly modelName: string;
  public readonly iotTopic?: Optional<string>;
  public readonly bleAddress?: Optional<string>;
  public readonly ic: number;
  public readonly goodsType: number;
  public readonly pactCode: number;
  public readonly pactType: number;
  public readonly version: Version;
  public readonly category: string;
  public readonly categoryGroup: string;
  public readonly status: BehaviorSubject<GoveeDeviceStatus>;

  constructor(args: DeviceConstructorArgs) {
    this.status = new BehaviorSubject(args as GoveeDeviceStatus);
    this.id = args.id;
    this.name = args.name;
    this.model = args.model;
    this.modelName = args.modelName;
    this.iotTopic = args.iotTopic;
    this.ic = args.ic;
    this.goodsType = args.goodsType;
    this.pactCode = args.pactCode;
    this.pactType = args.pactType;
    this.version = args.version;
    this.category = args.category;
    this.categoryGroup = args.categoryGroup;
  }

  private product: Optional<ProductModel>;
  get productData(): Optional<ProductModel> {
    return this.product;
  }
  set productData(product: Optional<ProductModel>) {
    this.product = product;
  }
}

export type BLEDeviceConstructorArgs = {
  bleAddress: string;
  bleName: string;
} & DeviceConstructorArgs;

export type BLEDevice = {
  get bleAddress(): string;
  bleName: string;
};

export const BLEDevice = <TDevice extends ClassConstructor<DeviceModel>>(
  device: TDevice,
): ClassConstructor<DeviceModel> => {
  class BLEDeviceMixin extends device implements BLEDevice {
    public readonly bleAddress: string;
    public bleName: string;

    constructor(...args: any[]) {
      super(args[0]);
      this.bleAddress = args[0].bleAddress;
      this.bleName = args[0].bleName;
    }
  }

  return BLEDeviceMixin;
};

export type WiFiDeviceConstructorArgs = {
  wifiAddress: string;
  wifiSSID: string;
} & DeviceConstructorArgs;

export type WiFiDevice = {
  get wifiAddress(): string;
  get wifiSSID(): string;
};

export const WiFiDevice = <TDevice extends ClassConstructor<DeviceModel>>(
  device: TDevice,
): ClassConstructor<DeviceModel> => {
  class WiFiDeviceMixin extends device implements WiFiDevice {
    public readonly wifiAddress: string;
    public wifiSSID: string;

    constructor(...args: any[]) {
      super(args[0]);
      this.wifiAddress = args[0].wifiAddress;
      this.wifiSSID = args[0].wifiName;
    }
  }

  return WiFiDeviceMixin;
};

export type IoTDeviceConstructorArgs = {
  iotTopic: string;
} & DeviceConstructorArgs;

export type IoTDevice = {
  get iotTopic(): Optional<string>;
} & DeviceModel;

export const IoTDevice = <TDevice extends ClassConstructor<DeviceModel>>(
  device: TDevice,
): ClassConstructor<DeviceModel> => {
  class IoTDeviceMixin extends device implements IoTDevice {
    public readonly iotTopic: string;

    constructor(...args: any[]) {
      super(args[0]);
      this.iotTopic = args[0].iotTopic;
    }
  }

  return IoTDeviceMixin;
};

export const createDeviceModel = (
  device: GoveeDevice,
  productCategories: Record<string, Product>,
): DeviceModel => {
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
  const product = productCategories[device.model];
  if (!product) {
    new Logger('CreateDevice').log(`No product info for ${device.model}`);
  }
  const newDevice = new constructor({
    ...device,
    version: new Version(device.hardwareVersion, device.softwareVersion),
    category: product?.category || 'unknown',
    categoryGroup: product?.group || 'unknown',
    modelName: product?.modelName || 'unknown',
    bleAddress: device.blueTooth?.mac,
    bleName: device.blueTooth?.name,
  });
  return newDevice;
};
