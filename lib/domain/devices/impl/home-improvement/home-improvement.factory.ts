import { Injectable } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { FactoryType } from '../../device.factory';
import { AirQualityFactory, AirQualitySensor } from './air-quality/air-quality';
import { DeviceModel } from '../../devices.model';
import { Device } from '../../device';
import { HygrometerFactory, HygrometerSensor } from './hygrometer/hygrometer';

@Injectable()
export class HomeImprovementFactory
  implements FactoryType<AirQualitySensor | HygrometerSensor>
{
  constructor(
    private readonly airQualityFactory: AirQualityFactory,
    private readonly hygrometerFactory: HygrometerFactory,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  create(
    deviceModel: DeviceModel,
  ): Optional<Device<AirQualitySensor | HygrometerSensor>> {
    return [this.airQualityFactory, this.hygrometerFactory]
      .map(
        (factory) =>
          factory.create(deviceModel, this.eventBus, this.commandBus) as Device<
            AirQualitySensor | HygrometerSensor
          >,
      )
      .find((d) => d !== undefined);
  }
}
