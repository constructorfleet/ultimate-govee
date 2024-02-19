import { Type } from '@nestjs/common';
import {
  Devices as ApplicanceDevices,
  DeviceStates as ApplianceStates,
} from './appliances';
import {
  Devices as HomeImprovementDevices,
  DeviceStates as HomeImprovementStates,
} from './home-improvement';
import { Devices as LightDevices, DeviceStates as LightStates } from './lights';
import { Device } from '../device';
import { HumidifierStates } from './appliances/humidifier/index';
import { PurifierStates } from './appliances/purifier/index';
import { IceMakerStates } from './appliances/ice-maker/index';
import { AirQualityStates } from './home-improvement/air-quality/index';
import { HygrometerStates } from './home-improvement/hygrometer/index';
import { RGBLightStates } from './lights/rgb/index';
import { RGBICLightStates } from './lights/rgbic/index';

export { AppliancesFactory, AppliancesModule } from './appliances';
export {
  HomeImprovementFactory,
  HomeImprovementModule,
} from './home-improvement';
export { LightsFactory, LightsModule } from './lights';

export const Devices: Type<Device>[] = [
  ...ApplicanceDevices,
  ...HomeImprovementDevices,
  ...LightDevices,
];
export {
  HumidifierStates,
  PurifierStates,
  IceMakerStates,
  AirQualityStates,
  HygrometerStates,
  RGBLightStates,
  RGBICLightStates,
};
export const DeviceStates: string[] = [
  ...ApplianceStates,
  ...HomeImprovementStates,
  ...LightStates,
];
