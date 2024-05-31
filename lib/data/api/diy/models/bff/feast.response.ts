import { Expose } from 'class-transformer';
import { TransformBoolean } from '~ultimate-govee-common';

export class FeastDeviceResponse {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'deviceName' })
  deviceName!: string;

  @Expose({ name: 'sku' })
  sku!: string;

  @Expose({ name: 'device' })
  device!: string;

  @Expose({ name: 'spec' })
  spec!: string;

  @Expose({ name: 'topic' })
  topic!: string;

  @Expose({ name: 'bleName' })
  bleName!: string;

  @Expose({ name: 'bleAddress' })
  bleAddress!: string;

  @Expose({ name: 'versionSoft' })
  versionSoft!: string;

  @Expose({ name: 'versionHard' })
  versionHard!: string;

  @Expose({ name: 'wifiSoftVersion' })
  wifiSoftVersion!: string;

  @Expose({ name: 'wifiHardVersion' })
  wifiHardVersion!: string;

  @Expose({ name: 'goodsType' })
  goodsType!: number;

  @Expose({ name: 'pactType' })
  pactType!: number;

  @Expose({ name: 'pactCode' })
  pactCode!: number;

  @Expose({ name: 'ic' })
  ic!: number;

  @Expose({ name: 'subDevices' })
  subDevices?: object;

  @Expose({ name: 'cmdVer' })
  cmdVer!: number;

  @Expose({ name: 'mark' })
  mark!: number;

  @Expose({ name: 'areaNum' })
  areaNum!: number;
}

export class FeastResponse {
  @Expose({ name: 'groupId' })
  groupId!: number;

  @Expose({ name: 'type' })
  type!: number;

  @Expose({ name: 'enable' })
  @TransformBoolean
  isEnabled!: boolean;

  @Expose({ name: 'presetState' })
  presetState!: number;

  @Expose({ name: 'feastId' })
  feastId!: number;

  @Expose({ name: 'presetId' })
  presetId!: number;
}
