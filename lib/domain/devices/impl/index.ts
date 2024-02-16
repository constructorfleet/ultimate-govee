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
export const DeviceStates: string[] = [
  ...ApplianceStates,
  ...HomeImprovementStates,
  ...LightStates,
];
