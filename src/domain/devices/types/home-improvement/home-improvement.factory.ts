import { Injectable } from '@nestjs/common';
import { Optional } from '@govee/common';
import { FactoryType } from '../device.factory';
import { SensorFactory } from './air-quality/air-quality';
import { DeviceModel } from '../../devices.model';
import { Device } from '../device';

@Injectable()
export class HomeImprovementFactory implements FactoryType {
  constructor(private readonly sensorFactory: SensorFactory) {}

  create(deviceModel: DeviceModel): Optional<Device> {
    return [this.sensorFactory]
      .map((factory) => factory.create(deviceModel))
      .find((d) => d !== undefined);
  }
}
