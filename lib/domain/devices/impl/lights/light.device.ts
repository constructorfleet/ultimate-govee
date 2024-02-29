import { Device } from '../../device';
import { DeviceStatesType } from '../../devices.types';

export abstract class LightDevice<
  States extends DeviceStatesType,
> extends Device<States> {}
