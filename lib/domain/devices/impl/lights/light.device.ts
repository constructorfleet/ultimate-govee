import { Device } from '../../device';
import { DeviceStates } from '../../devices.types';

export abstract class LightDevice<
  States extends DeviceStates,
> extends Device<States> {}
