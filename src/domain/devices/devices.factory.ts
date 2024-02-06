import { Injectable } from '@nestjs/common';
import { Optional } from '@govee/common';
import { AppliancesFactory } from './impl/appliances/appliances.factory';
import { LightsFactory } from './impl/lights/lights.factory';
import { DeviceModel } from './devices.model';
import { Device } from './device';
import { HomeImprovementFactory } from './impl/home-improvement';

@Injectable()
export class DevicesFactory {
  constructor(
    private readonly applianceFactory: AppliancesFactory,
    private readonly lightFactory: LightsFactory,
    private readonly homeImprovementFactory: HomeImprovementFactory,
  ) {}

  create(device: DeviceModel): Optional<Device> {
    return [
      this.applianceFactory,
      this.lightFactory,
      this.homeImprovementFactory,
    ]
      .map((factory) => factory.create(device))
      .find((d) => d !== undefined);
  }
}
