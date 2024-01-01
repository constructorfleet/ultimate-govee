import { DeviceModel } from '../..';
import { DeviceTypeFactory } from '../device-type';
import { HumidifierDevice } from './humidifier/humidifier';
import { PurifierDevice } from './purifier/purifier';

const HomeAppliances = 'Home Appliances';

const ApplianceTypes = [PurifierDevice, HumidifierDevice];

export const ApplianceFactory: DeviceTypeFactory = (device: DeviceModel) =>
  device.category?.toLowerCase() === HomeAppliances.toLowerCase()
    ? ApplianceTypes.map((applianceType) => applianceType.create(device)).find(
        (appliance) => appliance !== undefined,
      )
    : undefined;
