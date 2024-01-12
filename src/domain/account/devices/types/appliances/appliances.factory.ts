import { Injectable } from '@nestjs/common';
import { FactoryType } from '../device.factory';
import { HumidifierFactory } from './humidifier/humidifier';
import { PurifierFactory } from './purifier/purifier';
import { DeviceModel } from '../../devices.model';
import { Device } from '../device';

@Injectable()
export class AppliancesFactory implements FactoryType {
  constructor(
    private readonly humidifierFactory: HumidifierFactory,
    private readonly purifierFactory: PurifierFactory,
  ) {}

  create(deviceModel: DeviceModel): Device | undefined {
    return [this.humidifierFactory, this.purifierFactory]
      .map((factory) => factory.create(deviceModel))
      .find((d) => d !== undefined);
  }
}
