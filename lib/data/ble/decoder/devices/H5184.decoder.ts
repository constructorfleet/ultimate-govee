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
  ...probeNumbers: number[]
): UnpackedStruct | undefined => {
  const sensorIdsPacket = parseInt(
    `0x${Buffer.from(advertisement.manufacturerData).toString('hex').slice(16, 18)}`,
    16,
  );
  const sensorIds = fourProbesMapping[sensorIdsPacket];
  if (
    !sensorIds.includes(probeNumbers[0]) &&
    !sensorIds.includes(probeNumbers[1])
  ) {
    return undefined;
  }
  return unpackPacket(Buffer.from(advertisement.manufacturerData));
};

export const H5184 = {
  brand: 'Govee',
  model: 'H5184',
  modelName: 'WiFi Meat Thermometer',
  type: ['BBQ'],
};

export const decodeH5184: ModelDecoder = (
  advertisement: BleAdvertisement,
): DeviceDecodedProperties => {
  const unpacked1and2 = getProbeMeasurement(advertisement, 1, 2);
  const unpacked3and4 = getProbeMeasurement(advertisement, 1, 2);
  return {
    probes: {
      probe1: unpacked1and2?.firstProbe,
      probe2: unpacked1and2?.secondProbe,
      probe3: unpacked3and4?.firstProbe,
      probe4: unpacked3and4?.secondProbe,
    },
    ...H5184,
  };
};
