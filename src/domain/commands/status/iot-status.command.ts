import { Injectable } from '@nestjs/common';
import { IoTService } from '@govee/data';
import { DeviceCommand } from '../command';
import { Device } from '../../devices/device';

@Injectable()
export class IoTStatusCommand extends DeviceCommand {
  constructor(private readonly iot: IoTService) {
    super();
  }

  async execute(device: Device): Promise<void> {
    if (!device.iotTopic) {
      return;
    }
    this.iot.send(device.iotTopic, '');
  }
}
