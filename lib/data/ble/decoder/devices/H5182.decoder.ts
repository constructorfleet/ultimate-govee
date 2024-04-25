/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { BleAdvertisement } from '../../ble.types';
import { DeviceDecodedProperties, ModelDecoder } from './device.decoder';
import { unpack_hhbhh } from './packed-structures';

type ProbeMeasurement = {
  current?: number;
  min?: number;
  max?: number;
};

type UnpackedStruct = {
  firstProbe: ProbeMeasurement;
  secondProbe: ProbeMeasurement;
};

const fourProbesMapping = {
  1: [1, 2],
  65: [1, 2],
  129: [1, 2],
  193: [1, 2],
  2: [3, 4],
  66: [3, 4],
  130: [3, 4],
  194: [3, 4],
};

const unpackPacket = (manufacturerData: Buffer): UnpackedStruct => {
  const packet = Buffer.from(manufacturerData).toString('hex').slice(20, 39);
  const [probe1Temp, probe1Max, _, probe2Temp, probe2Max] = unpack_hhbhh(
    Buffer.from(packet),
  );
  return {
    firstProbe: {
      current: probe1Temp as number,
      max: probe1Max as number,
    },
    secondProbe: {
      current: probe2Temp as number,
      max: probe2Max as number,
    },
  };
};

const getProbeMeasurement = (
  advertisement: BleAdvertisement,
): UnpackedStruct | undefined => {
  return unpackPacket(Buffer.from(advertisement.manufacturerData));
};

export const H5182 = {
  brand: 'Govee',
  model: 'H5182',
  modelName: 'WiFi Meat Thermometer',
  type: ['BBQ'],
};

export const decodeH5182: ModelDecoder = (
  advertisement: BleAdvertisement,
): DeviceDecodedProperties => {
  const unpacked1and2 = getProbeMeasurement(advertisement);
  return {
    probes: {
      probe1: unpacked1and2?.firstProbe,
      probe2: unpacked1and2?.secondProbe,
    },
    ...H5182,
  };
};
