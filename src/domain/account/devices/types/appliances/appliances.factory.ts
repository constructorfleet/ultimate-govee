import { Injectable } from '@nestjs/common';
import { FactoryType } from '../device-type.factory';
import { HumidifierFactory } from './humidifier/humidifier';
import { PurifierFactory } from './purifier/purifier';
import { DeviceModel } from '../../devices.model';
import { DeviceType } from '../device-type';

@Injectable()
export class AppliancesFactory implements FactoryType {
  constructor(
    private readonly humidifierFactory: HumidifierFactory,
    private readonly purifierFactory: PurifierFactory,
  ) {}

  create(device: DeviceModel): DeviceType | undefined {
    return [this.humidifierFactory, this.purifierFactory]
      .map((factory) => factory.create(device))
      .find((d) => d !== undefined);
  }
}
