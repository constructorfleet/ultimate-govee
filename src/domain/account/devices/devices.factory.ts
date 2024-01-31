import { Injectable } from '@nestjs/common';
import { Optional } from '@govee/common';
import { AppliancesFactory } from './types/appliances';
import { LightsFactory } from './types/lights/lights.factory';
import { DeviceModel } from './devices.model';
import { Device } from './types/device';
import { HomeImprovementFactory } from './types/home-improvement';

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
