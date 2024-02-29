import { Injectable } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { FactoryType } from '../../device.factory';
import { Humidifier, HumidifierFactory } from './humidifier/humidifier';
import { Purifier, PurifierFactory } from './purifier/purifier';
import { IceMakerFactory, IceMakerStates } from './ice-maker/ice-maker';

import { DeviceModel } from '../../devices.model';
import { Device } from '../../device';

@Injectable()
export class AppliancesFactory
  implements FactoryType<Humidifier | IceMakerStates | Purifier>
{
  constructor(
    private readonly humidifierFactory: HumidifierFactory,
    private readonly purifierFactory: PurifierFactory,
    private readonly iceMakerFactory: IceMakerFactory,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  create(
    deviceModel: DeviceModel,
  ): Optional<Device<Humidifier | IceMakerStates | Purifier>> {
    return [this.humidifierFactory, this.purifierFactory, this.iceMakerFactory]
      .map(
        (factory) =>
          factory.create(deviceModel, this.eventBus, this.commandBus) as Device<
            Humidifier | IceMakerStates | Purifier
          >,
      )
      .find((d) => d !== undefined);
  }
}
