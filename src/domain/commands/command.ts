import { Device } from '../account/devices/types/device';

export abstract class DeviceCommand<CommandArguments = undefined> {
  abstract execute(device: Device, args: CommandArguments): Promise<void>;
}
