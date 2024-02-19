import { Type } from '@nestjs/common';
import * as cqrs from './cqrs';
import { Devices as ImplDevices, DeviceStates as ImplStates } from './impl';
import { Device } from './device';
import { DeviceStates as CommonStates } from './states';
import { HumidifierStates } from './impl/appliances/humidifier/index';
import { IceMakerStates } from './impl/appliances/ice-maker/index';
import { PurifierStates } from './impl/appliances/purifier/index';
import { AirQualityStates } from './impl/home-improvement/air-quality/index';
import { HygrometerStates } from './impl/home-improvement/hygrometer/index';
import { RGBICLightStates } from './impl/lights/rgbic/index';
import { RGBLightStates } from './impl/lights/rgb/index';

export * from './devices.module';
export * from './devices.service';
export * from './devices.model';
export * from './states';
export {
  HumidifierStates,
  IceMakerStates,
  PurifierStates,
  AirQualityStates,
  HygrometerStates,
  RGBICLightStates,
  RGBLightStates,
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
