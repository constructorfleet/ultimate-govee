import { BleAdvertisement } from '../../ble.types';
export type DevicePropertyDecoder = (
  advertisement: BleAdvertisement,
) => number | undefined;

export type DevicePropertiesDecoder<Properties extends readonly string[]> = {
  [s in Properties[number]]: DevicePropertyDecoder;
};
