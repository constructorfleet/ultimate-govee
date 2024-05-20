import { Injectable } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { FactoryType } from '../../device.factory';
import { AirQualityFactory, AirQualitySensor } from './air-quality/air-quality';
import { DeviceModel } from '../../devices.model';
import { Device } from '../../device';
import { HygrometerFactory, HygrometerSensor } from './hygrometer/hygrometer';
import { PresenceFactory, PresenceSensor } from './presence/presence';
import {
  MeatThermometerFactory,
  MeatThermometerSensor,
} from './meat-thermometer/meat-thermometer';

@Injectable()
export class HomeImprovementFactory
  implements
    FactoryType<
      | AirQualitySensor
      | HygrometerSensor
      | PresenceSensor
      | MeatThermometerSensor
    >
{
  constructor(
    private readonly airQualityFactory: AirQualityFactory,
    private readonly hygrometerFactory: HygrometerFactory,
    private readonly presenceFactory: PresenceFactory,
    private readonly meatThermometerFactory: MeatThermometerFactory,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  create(
    deviceModel: DeviceModel,
  ): Optional<
    Device<
      | AirQualitySensor
      | HygrometerSensor
      | PresenceSensor
      | MeatThermometerSensor
    >
  > {
    return [
      this.airQualityFactory,
      this.presenceFactory,
      this.hygrometerFactory,
      this.meatThermometerFactory,
    ]
      .map(
        (factory) =>
          factory.create(deviceModel, this.eventBus, this.commandBus) as Device<
            | AirQualitySensor
            | HygrometerSensor
            | PresenceSensor
            | MeatThermometerSensor
          >,
      )
      .find((d) => d !== undefined);
  }
}
