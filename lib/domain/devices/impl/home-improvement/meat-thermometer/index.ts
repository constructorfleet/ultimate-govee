import { BuzzerStateName, BuzzerState } from './meat-thermometer.states';
import { MeatThermometer } from './meat-thermometer';
import {
  MeatThermometerDevice,
  MeatThermometerSensor,
} from './meat-thermometer';
export {
  BuzzerStateName,
  BuzzerState,
  MeatThermometerDevice,
  MeatThermometerSensor,
  MeatThermometer,
};

// export const Devices: Type<Device>[] = [MeatThermometerDevice];
export const DeviceStates: string[] = [BuzzerStateName];
