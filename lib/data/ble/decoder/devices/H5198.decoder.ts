import { BleAdvertisement } from '../../ble.types';
import { DeviceDecodedProperties, ModelDecoder } from './device.decoder';
import { unpack_hhhhhh } from './packed-structures';

type ProbeMeasurement = {
  current: number;
  min: number;
  max: number;
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
  const packet = Buffer.from(manufacturerData).toString('hex').slice(20);
  const [probe1Temp, probe1Max, probe1Min, probe2Temp, probe2Max, probe2Min] =
    unpack_hhhhhh(Buffer.from(packet));
  return {
    firstProbe: {
      current: probe1Temp as number,
      min: probe1Min as number,
      max: probe1Max as number,
    },
    secondProbe: {
      current: probe2Temp as number,
      min: probe2Min as number,
      max: probe2Max as number,
    },
  };
};

const getProbeMeasurement = (
  advertisement: BleAdvertisement,
  ...probeNumbers: number[]
): UnpackedStruct | undefined => {
  const sensorIdsPacket = parseInt(
    `0x${Buffer.from(advertisement.manufacturerData).toString('hex').slice(12, 14)}`,
    16,
  );
  const sensorIds = fourProbesMapping[sensorIdsPacket];
  if (
    !sensorIds.includes(probeNumbers[0]) &&
    !sensorIds.includes(probeNumbers[1])
  ) {
    return undefined;
  }
  const packet = Buffer.from(advertisement.manufacturerData)
    .toString('hex')
    .slice(20, 48);
  return unpackPacket(Buffer.from(packet));
};

export const H5198 = {
  brand: 'Govee',
  model: 'H5198',
  modelName: 'WiFi Meat Thermometer',
  type: ['BBQ'],
};

export const decodeH5198: ModelDecoder = (
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
    ...H5198,
  };
};
