import { Injectable } from '@nestjs/common';
import { Optional } from '@govee/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { FactoryType } from '../../device.factory';
import { HumidifierFactory } from './humidifier/humidifier';
import { PurifierFactory } from './purifier/purifier';
import { DeviceModel } from '../../devices.model';
import { Device } from '../../device';

@Injectable()
export class AppliancesFactory implements FactoryType {
  constructor(
    private readonly humidifierFactory: HumidifierFactory,
    private readonly purifierFactory: PurifierFactory,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  create(deviceModel: DeviceModel): Optional<Device> {
    return [this.humidifierFactory, this.purifierFactory]
      .map((factory) =>
        factory.create(deviceModel, this.eventBus, this.commandBus),
      )
      .find((d) => d !== undefined);
  }
}
