import { Injectable } from '@nestjs/common';
import { AppliancesFactory } from './types/appliances';
import { LightsFactory } from './types/lights/lights.factory';
import { DeviceModel } from './devices.model';
import { Device } from './types/device';

@Injectable()
export class DevicesFactory {
  constructor(
    private readonly applianceFactory: AppliancesFactory,
    private readonly lightFactory: LightsFactory,
  ) {}

  create(device: DeviceModel): Device | undefined {
    return [this.lightFactory] // this.applianceFactory, this.lightFactory]
      .map((factory) => factory.create(device))
      .find((d) => d !== undefined);
  }
}
