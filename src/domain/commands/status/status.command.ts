import { Injectable } from '@nestjs/common';
import { DeviceCommand } from '../command';
import { Device } from '../../accounts';

@Injectable()
export class StatusCommand extends DeviceCommand {
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  async execute(device: Device): Promise<void> { }
}
