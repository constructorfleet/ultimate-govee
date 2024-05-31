import { Expose } from 'class-transformer';
import { TransformBoolean } from '~ultimate-govee-common';

export class DeviceObjectResponse {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'spec' })
  spec!: string;

  @Expose({ name: 'topic' })
  iotTopic!: string;

  @Expose({ name: 'bleName' })
  bluetoothName!: string;

  @Expose({ name: 'bleAddress' })
  bluetoothAddress!: string;

  @Expose({ name: 'versionSoft' })
  softwareVersion!: string;

  @Expose({ name: 'versionHard' })
  hardwareVersion!: string;

  @Expose({ name: 'wifiSoftVersion' })
  wifiSoftwareVersion?: string;

  @Expose({ name: 'wifiHardVersion' })
  wifiHardwareVersion?: string;

  @Expose({ name: 'goodsType' })
  goodsType!: number;

  @Expose({ name: 'pactType' })
  pactType!: number;

  @Expose({ name: 'pactCode' })
  pactCode!: number;

  @Expose({ name: 'subDevices' })
  subDevices?: unknown;

  @Expose({ name: 'ic' })
  ic!: number;

  @Expose({ name: 'ic_sub_1' })
  ic_sub_1?: number;

  @Expose({ name: 'ic_sub_2' })
  ic_sub_2?: number;

  @Expose({ name: 'subDevice' })
  subDevice?: string;

  @Expose({ name: 'settings' })
  settings?: unknown;

  @Expose({ name: 'feastId' })
  feastId?: number;

  @Expose({ name: 'feastName' })
  feastName?: string;

  @Expose({ name: 'feastType' })
  feastType?: number;

  @Expose({ name: 'isFeast' })
  @TransformBoolean
  isFeast?: boolean;

  @Expose({ name: 'subDeviceNum' })
  subDeviceNumber?: number;

  @Expose({ name: 'deviceSplicingStatus' })
  deviceSplicingStatus?: number;

  @Expose({ name: 'deviceInstallCount' })
  deviceInstallCount?: number;
}
