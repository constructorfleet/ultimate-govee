/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { BleAdvertisement } from '../../ble.types';
import { DeviceDecodedProperties, ModelDecoder } from './device.decoder';
import { unpack_hh } from './packed-structures';

type ProbeMeasurement = {
  current?: number;
  min?: number;
  max?: number;
};

type UnpackedStruct = {
  firstProbe: ProbeMeasurement;
};

const unpackPacket = (manufacturerData: Buffer): UnpackedStruct => {
  const packet = Buffer.from(manufacturerData).toString('hex').slice(20, 29);
  const [probe1Temp, probe1Max] = unpack_hh(Buffer.from(packet));
  return {
    firstProbe: {
      current: probe1Temp as number,
      max: probe1Max as number,
    },
  };
};

const getProbeMeasurement = (
  advertisement: BleAdvertisement,
): UnpackedStruct | undefined => {
  return unpackPacket(Buffer.from(advertisement.manufacturerData));
};

export const H5181 = {
  brand: 'Govee',
  model: 'H5181',
  modelName: 'WiFi Meat Thermometer',
  type: ['BBQ'],
};

export const decodeH5181: ModelDecoder = (
  advertisement: BleAdvertisement,
): DeviceDecodedProperties => {
  const unpacked1 = getProbeMeasurement(advertisement);
  return {
    probes: {
      probe1: unpacked1?.firstProbe,
    },
    ...H5181,
  };
};
