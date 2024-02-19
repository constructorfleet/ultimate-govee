import { Type } from '@nestjs/common';
import * as cqrs from './cqrs';
import { Devices as ImplDevices, DeviceStates as ImplStates } from './impl';
import { Device } from './device';
import { DeviceStates as CommonStates } from './states';
import { Humidifier } from './impl/appliances/humidifier/humidifier';
import { IceMaker } from './impl/appliances/ice-maker/ice-maker';
import { Purifier } from './impl/appliances/purifier/purifier';
import { AirQualitySensor } from './impl/home-improvement/air-quality/air-quality';
import { HygrometerSensor } from './impl/home-improvement/hygrometer/hygrometer';
import { RGBICLight } from './impl/lights/rgbic/rgbic-light';
import { RGBLight } from './impl/lights/rgb/rgb-light';

export * from './devices.module';
export * from './devices.service';
export * from './devices.model';
export * from './states';
export {
  Humidifier,
  IceMaker,
  Purifier,
  AirQualitySensor,
  HygrometerSensor,
  RGBICLight,
  RGBLight,
};

export const CQRS = cqrs;
export const Devices: Type<Device>[] = [...ImplDevices, Device];
export const DeviceStates: string[] = [...ImplStates, ...CommonStates].reduce(
  (acc, cur) => {
    if (!acc.includes(cur)) {
      acc.push(cur);
    }
    return acc;
  },
  [] as string[],
);
